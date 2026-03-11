"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { reservations } from "@/lib/api";
import { ShoppingCart, Trash2, ArrowLeft, CalendarDays, Package, CheckCircle } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const { items, removeItem, clear } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const total = items.reduce((acc, i) => acc + i.totalPrice, 0);

  const handleOrder = async () => {
    if (!user) { router.push("/login"); return; }
    setSubmitting(true);
    setError("");
    try {
      for (const item of items) {
        await reservations.create({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate,
        });
      }
      clear();
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-bg-alt flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demandes envoyées !</h2>
          <p className="text-gray-500 mb-6">Vos demandes de réservation ont été transmises aux propriétaires. Ils vous répondront prochainement.</p>
          <Link href="/reservations" className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors inline-block">
            Voir mes réservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/catalogue" className="inline-flex items-center gap-2 text-green-primary hover:text-green-darker text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Continuer mes achats
        </Link>

        <h1 className="text-3xl font-bold text-green-primary mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" /> Mon panier
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-200">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Votre panier est vide.</p>
            <Link href="/catalogue" className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors inline-block">
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.equipmentId} className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                  <div className="flex gap-4">
                    {item.primaryPhotoUrl ? (
                      <img src={item.primaryPhotoUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/catalogue/${item.equipmentId}`} className="font-bold text-gray-900 hover:text-green-primary transition-colors truncate">
                          {item.name}
                        </Link>
                        <button onClick={() => removeItem(item.equipmentId)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(item.startDate).toLocaleDateString("fr-CH")} — {new Date(item.endDate).toLocaleDateString("fr-CH")}
                          <span className="text-gray-400 ml-1">({item.days} jour{item.days > 1 ? "s" : ""})</span>
                        </p>
                        <p>Quantité : <strong>{item.quantity}</strong></p>
                        <p className="text-gray-400 text-xs">{item.dailyPrice} CHF/j × {item.quantity} × {item.days}j</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-green-primary">{item.totalPrice.toFixed(2)} CHF</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h3>
                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.equipmentId} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{item.name}</span>
                      <span className="font-medium flex-shrink-0">{item.totalPrice.toFixed(2)} CHF</span>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span className="text-green-primary">{total.toFixed(2)} CHF</span>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                  onClick={handleOrder}
                  disabled={submitting}
                  className="w-full bg-green-primary text-white hover:bg-green-darker disabled:opacity-50 py-3 rounded-full text-sm font-semibold transition-colors"
                >
                  {submitting ? "Envoi en cours..." : `Commander (${items.length} article${items.length > 1 ? "s" : ""})`}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Chaque propriétaire recevra votre demande et pourra l&apos;accepter ou la refuser.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
