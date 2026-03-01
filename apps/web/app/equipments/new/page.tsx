"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { equipments, categories, photos, type CategoryDto, type EquipmentPhotoDto } from "@/lib/api";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { ArrowLeft, Upload, X as XIcon, Star } from "lucide-react";

const CONDITIONS = ["Neuf", "Excellent", "Bon", "Correct", "Usé"];

export default function NewEquipmentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cats, setCats] = useState<CategoryDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPriceHT] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("Bon");
  const [categoryId, setCategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressCanton, setAddressCanton] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [isAvailable, setIsAvailable] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    categories.list().then(c => {
      setCats(c);
      if (c.length > 0 && !categoryId) setCategoryId(c[0].id);
    });
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const eq = await equipments.create({
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
      // Upload photos
      if (pendingFiles.length > 0) {
        setUploadingPhotos(true);
        for (const file of pendingFiles) {
          try { await photos.upload(eq.id, file); } catch { /* skip failed uploads */ }
        }
        setUploadingPhotos(false);
      }
      router.push(`/equipments/${eq.id}/edit`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/equipments" className="inline-flex items-center gap-2 text-green-primary hover:text-green-darker text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Mes équipements
        </Link>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-green-primary mb-6">Ajouter un équipement</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Scène mobile 6x4m"
                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Décrivez votre matériel, dimensions, spécifications..."
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
                <input type="number" value={dailyPrice} onChange={e => setDailyPriceHT(e.target.value)} required min="0" step="1" placeholder="150"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                  onChange={e => { if (e.target.files) setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]); }}
                  className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-green-primary transition-colors">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Cliquez pour ajouter des photos (max 5MB)</span>
                </label>
                {pendingFiles.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-primary"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Disponible à la location</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              Vous pourrez définir les périodes d&apos;indisponibilité (maintenance, usage personnel, etc.) dans le calendrier après la création de l&apos;équipement.
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 bg-green-primary text-white hover:bg-green-darker disabled:opacity-50 py-3 rounded-full text-sm font-semibold transition-colors">
                {uploadingPhotos ? "Upload photos..." : submitting ? "Création en cours..." : "Créer l\u0027équipement"}
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
