"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { equipments, categories, type EquipmentListDto, type CategoryDto } from "@/lib/api";
import { Search, MapPin, Package } from "lucide-react";

const EquipmentMap = dynamic(() => import("@/components/equipment-map").then(m => ({ default: m.EquipmentMap })), {
  ssr: false,
  loading: () => <div className="h-100 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Chargement de la carte...</div>,
});

export default function CataloguePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<EquipmentListDto[]>([]);
  const [cats, setCats] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");

  // Radius search state
  const [radiusCenter, setRadiusCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(20);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    categories.list().then(setCats);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedCanton) params.canton = selectedCanton;
    if (radiusCenter) {
      params.lat = radiusCenter.lat.toString();
      params.lng = radiusCenter.lng.toString();
      params.radius = radiusKm.toString();
    }
    equipments.list(params).then(setItems).finally(() => setLoading(false));
  }, [user, search, selectedCategory, selectedCanton, radiusCenter, radiusKm]);

  const handleRadiusSearch = useCallback((lat: number, lng: number, radius: number) => {
    setRadiusCenter({ lat, lng });
    setRadiusKm(radius);
  }, []);

  const handleClearRadius = useCallback(() => {
    setRadiusCenter(null);
  }, []);

  const cantons = ["AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR", "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG", "TI", "UR", "VD", "VS", "ZG", "ZH"];

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-primary">
            Catalogue <span className="text-orange-accent">matériel</span>
          </h1>
          <p className="text-gray-600 mt-2">Trouvez le matériel événementiel dont vous avez besoin.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher du matériel..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition text-gray-700"
            >
              <option value="">Toutes les catégories</option>
              {cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select
              value={selectedCanton}
              onChange={e => setSelectedCanton(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition text-gray-700"
            >
              <option value="">Tous les cantons</option>
              {cantons.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Radius slider - shown when radius is active */}
          {radiusCenter && (
            <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Rayon: {radiusKm} km</label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={radiusKm}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRadiusKm(val);
                  if (radiusCenter) handleRadiusSearch(radiusCenter.lat, radiusCenter.lng, val);
                }}
                className="flex-1 accent-[#00613a]"
              />
            </div>
          )}
        </div>

        {/* Map - always visible */}
        <div className="mb-6">
          <EquipmentMap
            items={items}
            onRadiusSearch={handleRadiusSearch}
            onClearRadius={handleClearRadius}
            radiusCenter={radiusCenter}
            radiusKm={radiusKm}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun équipement trouvé.</p>
            <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres{radiusCenter ? " ou d'augmenter le rayon" : ""}.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {items.length} équipement{items.length > 1 ? "s" : ""} trouvé{items.length > 1 ? "s" : ""}
              {radiusCenter ? ` dans un rayon de ${radiusKm} km` : ""}
            </p>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map(item => (
                <Link key={item.id} href={`/catalogue/${item.id}`} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group">
                  <div className="h-48 bg-linear-to-br from-green-primary/10 to-green-primary/5 flex items-center justify-center">
                    {item.primaryPhotoUrl ? (
                      <img src={item.primaryPhotoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-16 h-16 text-green-primary/30" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-primary/10 text-green-primary">{item.categoryName}</span>
                      <span className="text-xs text-gray-400">{item.condition}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-primary transition-colors mb-1">{item.name}</h3>
                    {item.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>}
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-green-primary">{item.dailyPrice} <span className="text-sm font-normal text-gray-500">CHF/jour</span></p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {item.city || "Suisse"}{item.canton ? ` (${item.canton})` : ""}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">par {item.organisationName} - Qte: {item.quantity}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
