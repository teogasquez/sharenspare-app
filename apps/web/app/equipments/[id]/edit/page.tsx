"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { equipments, categories, photos, type EquipmentDto, type CategoryDto, type EquipmentPhotoDto } from "@/lib/api";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { ArrowLeft, Upload, X as XIcon, Star } from "lucide-react";

const CONDITIONS = ["Neuf", "Excellent", "Bon", "Correct", "Usé"];

export default function EditEquipmentPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cats, setCats] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPriceHT] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("Bon");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [address, setAddress] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressCanton, setAddressCanton] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [existingPhotos, setExistingPhotos] = useState<EquipmentPhotoDto[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    Promise.all([equipments.get(id), categories.list()])
      .then(([eq, c]) => {
        setCats(c);
        setName(eq.name);
        setDescription(eq.description || "");
        setDailyPriceHT(String(eq.dailyPrice));
        setQuantity(String(eq.quantity));
        setCondition(eq.condition);
        setCategoryId(eq.category.id);
        setIsAvailable(eq.isAvailable);
        setAddress(eq.address || "");
        setAddressCity(eq.city || "");
        setAddressCanton(eq.canton || "");
        setLat(eq.latitude ?? undefined);
        setLng(eq.longitude ?? undefined);
        setExistingPhotos(eq.photos);
      })
      .catch(() => setError("Équipement introuvable."))
      .finally(() => setLoading(false));
  }, [id, user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await equipments.update(id, {
        name,
        description: description || undefined,
        dailyPrice: parseFloat(dailyPrice),
        quantity: parseInt(quantity),
        condition,
        categoryId,
        isAvailable,
        address: address || undefined,
        city: addressCity || undefined,
        canton: addressCanton || undefined,
        latitude: lat,
        longitude: lng,
      });
      router.push("/equipments");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const photo = await photos.upload(id, file);
        setExistingPhotos(prev => [...prev, photo]);
      } catch { /* skip */ }
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await photos.delete(id, photoId);
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch { alert("Erreur suppression photo."); }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await photos.setPrimary(id, photoId);
      setExistingPhotos(prev => prev.map(p => ({ ...p, isPrimary: p.id === photoId })));
    } catch { /* skip */ }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/equipments" className="inline-flex items-center gap-2 text-green-primary hover:text-green-darker text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Mes équipements
        </Link>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-green-primary mb-6">Modifier l&apos;équipement</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-gray-700">
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">État *</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} required
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-gray-700">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix/jour (CHF) *</label>
                <input type="number" value={dailyPrice} onChange={e => setDailyPriceHT(e.target.value)} required min="0" step="1"
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité disponible *</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1"
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
              </div>
            </div>

            {/* Adresse */}
            <AddressAutocomplete
              value={address}
              onChange={(data) => {
                setAddress(data.address);
                setAddressCity(data.city);
                setAddressCanton(data.canton);
                setLat(data.latitude);
                setLng(data.longitude);
              }}
            />
            {lat && lng && (
              <p className="text-xs text-gray-400 -mt-3">
                {addressCity}{addressCanton ? ` (${addressCanton})` : ""} — {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              {existingPhotos.length > 0 && (
                <div className="flex gap-3 mb-3 flex-wrap">
                  {existingPhotos.map(p => (
                    <div key={p.id} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 group">
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button type="button" onClick={() => handleSetPrimary(p.id)}
                          className={`p-1 rounded-full ${p.isPrimary ? "bg-yellow-400 text-yellow-900" : "bg-white/80 text-gray-600 hover:bg-yellow-400 hover:text-yellow-900"}`} title="Photo principale">
                          <Star className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => handleDeletePhoto(p.id)}
                          className="p-1 rounded-full bg-white/80 text-red-500 hover:bg-red-500 hover:text-white" title="Supprimer">
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                      {p.isPrimary && <span className="absolute top-0.5 left-0.5 bg-yellow-400 text-yellow-900 text-[10px] px-1 rounded font-bold">P</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                  onChange={e => { if (e.target.files) handleUpload(e.target.files); }}
                  className="hidden" id="photo-upload-edit" disabled={uploading} />
                <label htmlFor="photo-upload-edit" className="cursor-pointer flex items-center gap-2 text-gray-500 hover:text-green-primary transition-colors text-sm justify-center">
                  <Upload className="w-5 h-5" />
                  {uploading ? "Upload en cours..." : "Ajouter des photos"}
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-primary"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Disponible à la location</span>
            </div>

            {/* Calendrier d'indisponibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Périodes d&apos;indisponibilité</label>
              <p className="text-xs text-gray-500 mb-3">
                Cliquez sur deux dates pour bloquer une période. Cliquez sur une date rouge pour la débloquer. Les dates grises sont déjà réservées.
              </p>
              <AvailabilityCalendar equipmentId={id} editable />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 bg-green-primary text-white hover:bg-green-darker disabled:opacity-50 py-3 rounded-full text-sm font-semibold transition-colors">
                {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
              <Link href="/equipments" className="py-3 px-6 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
