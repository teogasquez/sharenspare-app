"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { admin, type UserDto, type OrganisationDto, type InvitationDto, type AdminStatsDto } from "@/lib/api";
import { ShieldCheck, Users, Building, Mail, Plus, Check, CheckCircle, Ban, BarChart3, Package, CalendarCheck, TrendingUp, Copy } from "lucide-react";

type Tab = "stats" | "users" | "organisations" | "invitations";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [orgs, setOrgs] = useState<OrganisationDto[]>([]);
  const [invitations, setInvitations] = useState<InvitationDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [invEmail, setInvEmail] = useState("");
  const [invOrgName, setInvOrgName] = useState("");
  const [invRole, setInvRole] = useState("Festival");
  const [invSubmitting, setInvSubmitting] = useState(false);
  const [invError, setInvError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyInviteLink = (inv: InvitationDto) => {
    const url = `${window.location.origin}/register?token=${inv.token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!authLoading && user && user.role !== "Admin") { router.push("/dashboard"); return; }
    if (!user || user.role !== "Admin") return;

    setLoading(true);
    const loadData = async () => {
      try {
        if (tab === "stats") setStats(await admin.stats());
        else if (tab === "users") setUsers(await admin.users());
        else if (tab === "organisations") setOrgs(await admin.organisations());
        else setInvitations(await admin.invitations());
      } finally { setLoading(false); }
    };
    loadData();
  }, [user, authLoading, router, tab]);

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      await admin.toggleUserActive(userId, isActive);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive } : u));
    } catch { alert("Erreur lors de la mise à jour."); }
  };

  const verifyOrg = async (orgId: string) => {
    try {
      await admin.verifyOrganisation(orgId);
      setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, isVerified: true } : o));
    } catch { alert("Erreur lors de la vérification."); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvSubmitting(true);
    setInvError("");
    try {
      const inv = await admin.createInvitation({ email: invEmail, organisationName: invOrgName, role: invRole });
      setInvitations(prev => [inv, ...prev]);
      setShowInviteForm(false);
      setInvEmail("");
      setInvOrgName("");
    } catch (err: any) {
      setInvError(err.message || "Erreur.");
    } finally { setInvSubmitting(false); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  if (!user || user.role !== "Admin") return null;

  return (
    <div className="min-h-screen bg-bg-alt py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-primary" />
          <div>
            <h1 className="text-3xl font-bold text-green-primary">Administration</h1>
            <p className="text-gray-600 mt-1">Gestion des utilisateurs, organisations et invitations.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          {([
            { key: "stats" as Tab, label: "Statistiques", icon: BarChart3 },
            { key: "users" as Tab, label: "Utilisateurs", icon: Users },
            { key: "organisations" as Tab, label: "Organisations", icon: Building },
            { key: "invitations" as Tab, label: "Invitations", icon: Mail },
          ]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-2 ${tab === key ? "bg-white shadow text-green-primary" : "text-gray-600 hover:text-gray-900"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Chargement...</div>
        ) : (
          <>
            {/* Stats Tab */}
            {tab === "stats" && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-500">CA Plateforme (15%)</p>
                  </div>
                  <p className="text-2xl font-bold text-green-primary">{stats.platformRevenue.toFixed(2)} CHF</p>
                  <p className="text-xs text-gray-400 mt-1">sur {stats.totalRevenue.toFixed(2)} CHF de transactions</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Réservations du jour</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.reservationsToday}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.activeReservations} en cours / {stats.totalReservations} total</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-500">Utilisateurs</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.totalOrgs} organisations</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-500">Équipements</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEquipments}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {tab === "users" && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Organisation</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.organisation.name}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${u.role === "Admin" ? "bg-purple-100 text-purple-800" : u.role === "Festival" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {u.isActive ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.role !== "Admin" && (
                              <button onClick={() => toggleUserActive(u.id, !u.isActive)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${u.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                                {u.isActive ? <><Ban className="w-3 h-3 inline mr-1" />Désactiver</> : <><Check className="w-3 h-3 inline mr-1" />Activer</>}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Organisations Tab */}
            {tab === "organisations" && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Localisation</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vérifiée</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orgs.map(org => (
                        <tr key={org.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{org.name}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">{org.type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {org.city || "-"}{org.canton ? ` (${org.canton})` : ""}
                          </td>
                          <td className="px-6 py-4">
                            {org.isVerified ? (
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Oui
                              </span>
                            ) : (
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">En attente</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!org.isVerified && (
                              <button onClick={() => verifyOrg(org.id)}
                                className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Vérifier
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invitations Tab */}
            {tab === "invitations" && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button onClick={() => setShowInviteForm(!showInviteForm)}
                    className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nouvelle invitation
                  </button>
                </div>

                {showInviteForm && (
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Inviter une organisation</h3>
                    <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} required placeholder="contact@festival.ch"
                          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom organisation</label>
                        <input type="text" value={invOrgName} onChange={e => setInvOrgName(e.target.value)} required placeholder="Festival XYZ"
                          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                        <select value={invRole} onChange={e => setInvRole(e.target.value)}
                          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-gray-700">
                          <option value="Festival">Festival</option>
                          <option value="Pro">Pro</option>
                        </select>
                      </div>
                      <button type="submit" disabled={invSubmitting}
                        className="bg-green-primary text-white hover:bg-green-darker disabled:opacity-50 py-2.5 px-6 rounded-full text-sm font-semibold transition-colors">
                        {invSubmitting ? "Envoi..." : "Envoyer"}
                      </button>
                    </form>
                    {invError && <p className="text-red-500 text-sm mt-2">{invError}</p>}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Organisation</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Expire</th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Lien</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invitations.map(inv => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{inv.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{inv.organisationName}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">{inv.role}</span>
                            </td>
                            <td className="px-6 py-4">
                              {inv.usedAt ? (
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Utilisé</span>
                              ) : new Date(inv.expiresAt) < new Date() ? (
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Expiré</span>
                              ) : (
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">En attente</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(inv.expiresAt).toLocaleDateString("fr-CH")}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!inv.usedAt && new Date(inv.expiresAt) >= new Date() && (
                                <button onClick={() => copyInviteLink(inv)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                                  {copiedId === inv.id ? <><Check className="w-3 h-3" /> Copié !</> : <><Copy className="w-3 h-3" /> Copier le lien</>}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {invitations.length === 0 && (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune invitation envoyée.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
