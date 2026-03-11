"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { equipments, type EquipmentDto } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { Package, MapPin, ArrowLeft, CalendarDays, Tag, Building, Info, CheckCircle, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const router = useRouter();
  const [item, setItem] = useState<EquipmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    equipments.get(id).then(setItem).catch(() => setError("Équipement introuvable.")).finally(() => setLoading(false));
  }, [id]);

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 0;
  const totalPrice = item ? days * quantity * item.dailyPrice : 0;

  const handleAddToCart = () => {
    if (!user) { router.push("/login"); return; }
    if (!item || !startDate || !endDate) return;
    addItem({
      equipmentId: id,
      name: item.name,
      primaryPhotoUrl: item.photos[0]?.url,
      dailyPrice: item.dailyPrice,
      startDate,
      endDate,
      quantity,
      maxQuantity: item.quantity,
      days,
      totalPrice,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const isInCart = items.some(i => i.equipmentId === id);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  if (error && !item) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!item) return null;

  const isOwner = user?.organisation.id === item.organisation.id;
  const conditions: Record<string, string> = { Neuf: "Neuf", Excellent: "Excellent", Bon: "Bon", Correct: "Correct", "Usé": "Usé" };

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link href="/catalogue" className="inline-flex items-center gap-2 text-green-primary hover:text-green-darker text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="relative h-72 md:h-96 bg-gradient-to-br from-green-primary/10 to-green-primary/5 flex items-center justify-center">
                {item.photos.length > 0 ? (
                  <>
                    <img src={item.photos[photoIndex]?.url} alt={item.name} className="w-full h-full object-cover" />
                    {item.photos.length > 1 && (
                      <>
                        <button onClick={() => setPhotoIndex(i => (i - 1 + item.photos.length) % item.photos.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors">
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button onClick={() => setPhotoIndex(i => (i + 1) % item.photos.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                          {photoIndex + 1} / {item.photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Package className="w-24 h-24 text-green-primary/30" />
                )}
              </div>
              {item.photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {item.photos.map((p, i) => (
                    <button key={p.id} onClick={() => setPhotoIndex(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === photoIndex ? "border-green-primary" : "border-transparent hover:border-gray-300"}`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-primary/10 text-green-primary">{item.category.name}</span>
                <span className="text-xs text-gray-500">{conditions[item.condition] || item.condition}</span>
                {item.isAvailable ? (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">Disponible</span>
                ) : (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-700">Indisponible</span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>

              <p className="text-2xl font-bold text-green-primary mb-4">
                {item.dailyPrice} <span className="text-base font-normal text-gray-500">CHF/jour</span>
              </p>

              {item.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>Quantité disponible : <strong>{item.quantity}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>Ajouté le {new Date(item.createdAt).toLocaleDateString("fr-CH")}</span>
                </div>
              </div>
            </div>

            {/* Organisation */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Building className="w-5 h-5 text-green-primary" /> Propriétaire</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-primary/10 rounded-full flex items-center justify-center text-green-primary font-bold text-lg">
                  {item.organisation.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.organisation.name}</p>
                  <p className="text-sm text-gray-500">{item.organisation.type}</p>
                  {(item.organisation.city || item.organisation.canton) && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.organisation.city}{item.organisation.canton ? ` (${item.organisation.canton})` : ""}
                    </p>
                  )}
                  {item.organisation.isVerified && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" /> Organisation vérifiée
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
              {isOwner ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">C&apos;est votre équipement.</p>
                  <Link href={`/equipments/${item.id}/edit`} className="mt-4 bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors inline-block">
                    Modifier
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Disponibilité — cliquez pour sélectionner vos dates</h4>
                    <AvailabilityCalendar
                      equipmentId={id}
                      onRangeSelect={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                      }}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">Ajouter au panier</h3>
                  {!item.isAvailable && (
                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">Ce matériel n&apos;est pas disponible actuellement.</div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                      <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} max={item.quantity}
                        className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="Précisions sur votre événement..."
                        className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none resize-none" />
                    </div>

                    {days > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">{item.dailyPrice} CHF x {quantity} x {days} jour{days > 1 ? "s" : ""}</span><span className="font-medium">{totalPrice.toFixed(2)} CHF</span></div>
                        <hr className="my-2" />
                        <div className="flex justify-between text-base"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-green-primary">{totalPrice.toFixed(2)} CHF</span></div>
                      </div>
                    )}

                    {addedToCart && (
                      <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Ajouté au panier !
                        <Link href="/panier" className="ml-auto font-semibold underline">Voir le panier</Link>
                      </div>
                    )}

                    <button
                      onClick={handleAddToCart}
                      disabled={!startDate || !endDate || !item.isAvailable}
                      className="w-full bg-green-primary text-white hover:bg-green-darker disabled:opacity-50 py-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isInCart ? "Mettre à jour le panier" : "Ajouter au panier"}
                    </button>

                    {isInCart && !addedToCart && (
                      <Link href="/panier" className="w-full border-2 border-green-primary text-green-primary hover:bg-green-primary hover:text-white py-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        Voir le panier
                      </Link>
                    )}

                    {!user && <p className="text-xs text-gray-400 text-center">Vous devez être connecté pour réserver.</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
