"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { equipments, reservations, type EquipmentListDto, type ReservationDto } from "@/lib/api";
import { StatusBadge } from "@/components/status-badge";
import { Package, Plus, ArrowRight, Building, MapPin, TrendingUp, CalendarCheck } from "lucide-react";

type ReservationTab = "pending" | "active" | "history";
type LocationTab = "pending" | "active" | "history";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myEquipments, setMyEquipments] = useState<EquipmentListDto[]>([]);
  const [myReservations, setMyReservations] = useState<ReservationDto[]>([]);
  const [myLocations, setMyLocations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservationTab, setReservationTab] = useState<ReservationTab>("pending");
  const [locationTab, setLocationTab] = useState<LocationTab>("pending");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    Promise.all([
      equipments.mine(),
      reservations.list("requester"),
      reservations.list("owner"),
    ])
      .then(([eq, req, own]) => {
        setMyEquipments(eq);
        setMyReservations(req);
        setMyLocations(own);
      })
      .catch(() => {/* ignore — données restent vides */})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Chargement...</div></div>;
  }

  if (!user) return null;

  const pendingReservations = myReservations.filter(r => ["Pending", "QuoteSent"].includes(r.status));
  const activeReservations = myReservations.filter(r => ["Accepted", "InProgress"].includes(r.status));
  const historyReservations = myReservations.filter(r => ["Returned", "Closed", "Rejected", "Cancelled"].includes(r.status));

  const pendingLocations = myLocations.filter(r => ["Pending", "QuoteSent"].includes(r.status));
  const activeLocations = myLocations.filter(r => ["Accepted", "InProgress"].includes(r.status));
  const historyLocations = myLocations.filter(r => ["Returned", "Closed", "Rejected", "Cancelled"].includes(r.status));

  const revenue = myLocations
    .filter(r => r.status === "Closed")
    .reduce((acc, r) => acc + r.totalPrice, 0);

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${active ? "bg-green-primary text-white" : "text-gray-600 hover:bg-gray-100"}`;

  const currentReservations = reservationTab === "pending" ? pendingReservations : reservationTab === "active" ? activeReservations : historyReservations;
  const currentLocations = locationTab === "pending" ? pendingLocations : locationTab === "active" ? activeLocations : historyLocations;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Mes équipements", value: myEquipments.length, icon: Package, color: "text-green-primary" },
            { label: "En attente", value: pendingReservations.length + pendingLocations.length, icon: CalendarCheck, color: "text-yellow-600" },
            { label: "Locations actives", value: activeLocations.length, icon: TrendingUp, color: "text-blue-600" },
            { label: "Revenus générés", value: `${revenue.toLocaleString("fr-CH")} CHF`, icon: TrendingUp, color: "text-green-primary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Réservations (I'm requester) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-primary">Mes réservations</h2>
              <Link href="/reservations" className="text-green-primary text-sm font-semibold hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-2 mb-4">
              {([
                { key: "pending" as ReservationTab, label: "En attente", count: pendingReservations.length },
                { key: "active" as ReservationTab, label: "Actives", count: activeReservations.length },
                { key: "history" as ReservationTab, label: "Historique", count: historyReservations.length },
              ]).map(t => (
                <button key={t.key} onClick={() => setReservationTab(t.key)} className={tabClass(reservationTab === t.key)}>
                  {t.label}{t.count > 0 ? ` (${t.count})` : ""}
                </button>
              ))}
            </div>
            {currentReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Aucune réservation.</p>
            ) : (
              <div className="space-y-3">
                {currentReservations.slice(0, 5).map(res => (
                  <Link key={res.id} href="/reservations" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{res.equipment.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(res.startDate).toLocaleDateString("fr-CH")} — {new Date(res.endDate).toLocaleDateString("fr-CH")}
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Locations (I'm owner) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-primary">Mes locations</h2>
              <Link href="/reservations" className="text-green-primary text-sm font-semibold hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-2 mb-4">
              {([
                { key: "pending" as LocationTab, label: "En attente", count: pendingLocations.length },
                { key: "active" as LocationTab, label: "Actives", count: activeLocations.length },
                { key: "history" as LocationTab, label: "Historique", count: historyLocations.length },
              ]).map(t => (
                <button key={t.key} onClick={() => setLocationTab(t.key)} className={tabClass(locationTab === t.key)}>
                  {t.label}{t.count > 0 ? ` (${t.count})` : ""}
                </button>
              ))}
            </div>
            {currentLocations.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Aucune location.</p>
            ) : (
              <div className="space-y-3">
                {currentLocations.slice(0, 5).map(res => (
                  <Link key={res.id} href="/reservations" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{res.equipment.name}</p>
                      <p className="text-xs text-gray-500">
                        par {res.requesterOrganisation.name} — {new Date(res.startDate).toLocaleDateString("fr-CH")}
                      </p>
                    </div>
                    <StatusBadge status={res.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mes équipements */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-primary">Mes équipements</h2>
              <div className="flex items-center gap-3">
                <Link href="/equipments" className="text-green-primary text-sm font-semibold hover:underline flex items-center gap-1">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Link>
                <Link href="/equipments/new" className="bg-green-primary text-white hover:bg-green-darker transition-colors text-sm font-semibold py-2 px-4 rounded-full inline-flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Ajouter
                </Link>
              </div>
            </div>
            {myEquipments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun équipement. Ajoutez votre premier matériel.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {myEquipments.slice(0, 6).map(eq => (
                  <Link key={eq.id} href={`/equipments/${eq.id}/edit`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{eq.name}</p>
                      <p className="text-xs text-gray-500">{eq.categoryName} — {eq.dailyPrice} CHF/j</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-2 ${eq.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {eq.isAvailable ? "Dispo" : "Masqué"}
                    </span>
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
