"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { equipments, reservations, type EquipmentListDto, type ReservationDto } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { Package, CalendarCheck, Plus, ArrowRight, Building, MapPin } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myEquipments, setMyEquipments] = useState<EquipmentListDto[]>([]);
  const [myReservations, setMyReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    Promise.all([equipments.mine(), reservations.list()])
      .then(([eq, res]) => { setMyEquipments(eq); setMyReservations(res); })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement...</div></div>;
  }

  if (!user) return null;

  const pendingReservations = myReservations.filter(r => ["Pending", "QuoteSent"].includes(r.status));
  const activeReservations = myReservations.filter(r => ["Accepted", "InProgress"].includes(r.status));

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-primary">
            Bonjour, <span className="text-orange-accent">{user.firstName}</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Building className="w-4 h-4" />
            <span>{user.organisation.name}</span>
            {user.organisation.city && (
              <>
                <MapPin className="w-4 h-4 ml-2" />
                <span>{user.organisation.city}{user.organisation.canton ? ` (${user.organisation.canton})` : ""}</span>
              </>
            )}
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-primary/10 text-green-primary font-medium">{user.role}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Mes équipements", value: myEquipments.length, icon: Package, color: "text-green-primary" },
            { label: "Réservations en attente", value: pendingReservations.length, icon: CalendarCheck, color: "text-yellow-600" },
            { label: "Réservations actives", value: activeReservations.length, icon: CalendarCheck, color: "text-blue-600" },
            { label: "Total réservations", value: myReservations.length, icon: CalendarCheck, color: "text-gray-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Equipment */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-primary">Mes équipements</h2>
              <Link href="/equipments/new" className="bg-green-primary text-white hover:bg-green-darker transition-colors text-sm font-semibold py-2 px-4 rounded-full inline-flex items-center gap-1">
                <Plus className="w-4 h-4" /> Ajouter
              </Link>
            </div>
            {myEquipments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun équipement. Ajoutez votre premier matériel.</p>
            ) : (
              <div className="space-y-3">
                {myEquipments.slice(0, 5).map(eq => (
                  <Link key={eq.id} href={`/catalogue/${eq.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{eq.name}</p>
                      <p className="text-sm text-gray-500">{eq.categoryName} - {eq.dailyPrice} CHF/j</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${eq.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {eq.isAvailable ? "Disponible" : "Indisponible"}
                    </span>
                  </Link>
                ))}
                {myEquipments.length > 5 && (
                  <Link href="/equipments" className="text-green-primary text-sm font-semibold flex items-center gap-1 justify-center pt-2">
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-primary">Réservations récentes</h2>
              <Link href="/reservations" className="text-green-primary text-sm font-semibold hover:underline">Voir tout</Link>
            </div>
            {myReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune réservation pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {myReservations.slice(0, 5).map(res => (
                  <Link key={res.id} href={`/reservations`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{res.equipment.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(res.startDate).toLocaleDateString("fr-CH")} - {new Date(res.endDate).toLocaleDateString("fr-CH")}
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
