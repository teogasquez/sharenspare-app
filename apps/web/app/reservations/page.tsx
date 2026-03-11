"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { reservations, type ReservationDto } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { CalendarCheck, ArrowRight, Check, X, Play, RotateCcw, Archive } from "lucide-react";

type Tab = "requester" | "owner";

const WORKFLOW_ACTIONS: Record<string, { label: string; status: string; icon: typeof Check; color: string; ownerOnly?: boolean; requesterOnly?: boolean }[]> = {
  Pending: [
    { label: "Accepter", status: "Accepted", icon: Check, color: "bg-green-600 hover:bg-green-700", ownerOnly: true },
    { label: "Refuser", status: "Rejected", icon: X, color: "bg-red-600 hover:bg-red-700", ownerOnly: true },
    { label: "Annuler", status: "Cancelled", icon: X, color: "bg-gray-600 hover:bg-gray-700", requesterOnly: true },
  ],
  Accepted: [
    { label: "Démarrer", status: "InProgress", icon: Play, color: "bg-purple-600 hover:bg-purple-700", ownerOnly: true },
    { label: "Annuler", status: "Cancelled", icon: X, color: "bg-gray-600 hover:bg-gray-700" },
  ],
  InProgress: [
    { label: "Marquer retourné", status: "Returned", icon: RotateCcw, color: "bg-indigo-600 hover:bg-indigo-700", ownerOnly: true },
  ],
  Returned: [
    { label: "Clôturer", status: "Closed", icon: Archive, color: "bg-gray-600 hover:bg-gray-700", ownerOnly: true },
  ],
};

export default function ReservationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { clearUnread } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("requester");
  const [items, setItems] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    setLoading(true);
    reservations.list(tab).then(setItems).finally(() => setLoading(false));
  }, [user, authLoading, router, tab]);

  const handleAction = async (resId: string, status: string) => {
    const note = status === "Rejected" ? prompt("Raison du refus (optionnel):") : undefined;
    setActionLoading(resId);
    try {
      const updated = await reservations.updateStatus(resId, status, note || undefined);
      setItems(prev => prev.map(r => r.id === resId ? updated : r));
    } catch (err: any) {
      alert(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement...</div></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-primary">Réservations</h1>
          <p className="text-gray-600 mt-1">Gérez vos demandes de location et celles reçues.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          <button onClick={() => setTab("requester")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "requester" ? "bg-white shadow text-green-primary" : "text-gray-600 hover:text-gray-900"}`}>
            Mes réservations
          </button>
          <button onClick={() => setTab("owner")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "owner" ? "bg-white shadow text-green-primary" : "text-gray-600 hover:text-gray-900"}`}>
            Demandes reçues
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {tab === "requester" ? "Vous n'avez pas encore fait de réservation." : "Aucune demande reçue."}
            </p>
            {tab === "requester" && (
              <Link href="/catalogue" className="mt-4 inline-flex items-center gap-2 text-green-primary text-sm font-semibold hover:underline">
                Parcourir le catalogue <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(res => {
              const actions = WORKFLOW_ACTIONS[res.status] || [];
              const filteredActions = actions.filter(a => {
                if (a.ownerOnly && tab !== "owner") return false;
                if (a.requesterOnly && tab !== "requester") return false;
                return true;
              });

              return (
                <div key={res.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link href={`/catalogue/${res.equipment.id}`} className="text-lg font-bold text-gray-900 hover:text-green-primary transition-colors">
                          {res.equipment.name}
                        </Link>
                        <StatusBadge status={res.status} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="text-gray-400">Dates:</span>{" "}
                          {new Date(res.startDate).toLocaleDateString("fr-CH")} - {new Date(res.endDate).toLocaleDateString("fr-CH")}
                        </p>
                        <p>
                          <span className="text-gray-400">Qte:</span> {res.quantity}
                        </p>
                        <p>
                          <span className="text-gray-400">{tab === "requester" ? "Propriétaire" : "Demandeur"}:</span>{" "}
                          {tab === "requester" ? res.ownerOrganisation.name : res.requesterOrganisation.name}
                        </p>
                      </div>
                      {res.message && <p className="text-sm text-gray-500 mt-2 italic">&laquo; {res.message} &raquo;</p>}
                      {res.ownerNote && <p className="text-sm text-orange-accent mt-1">Note: {res.ownerNote}</p>}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-primary">{res.totalPrice.toFixed(2)} CHF</p>
                      </div>

                      {filteredActions.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {filteredActions.map(action => (
                            <button
                              key={action.status}
                              onClick={() => handleAction(res.id, action.status)}
                              disabled={actionLoading === res.id}
                              className={`${action.color} text-white text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors disabled:opacity-50`}
                            >
                              <action.icon className="w-3 h-3" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
