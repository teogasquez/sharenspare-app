"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth, ApiError } from "@/lib/api";
import { Mail, Phone, Globe, MapPin, AlignLeft, Building, Lock, Check, AlertCircle } from "lucide-react";

export default function ProfilPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [account, setAccount] = useState({ email: "", phone: "" });
  const [org, setOrg] = useState({ name: "", website: "", city: "", phone: "", description: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  const [accountMsg, setAccountMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [orgMsg, setOrgMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [accountLoading, setAccountLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setAccount({ email: user.email, phone: user.phone || "" });
    setOrg({
      name: user.organisation.name,
      website: user.organisation.website || "",
      city: user.organisation.city || "",
      phone: user.organisation.phone || "",
      description: user.organisation.description || "",
    });
  }, [user]);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountLoading(true);
    setAccountMsg(null);
    try {
      await auth.updateMe({ email: account.email, phone: account.phone });
      await refreshUser();
      setAccountMsg({ type: "success", text: "Informations mises à jour." });
    } catch (err) {
      setAccountMsg({ type: "error", text: err instanceof ApiError ? err.message : "Erreur." });
    } finally { setAccountLoading(false); }
  };

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgLoading(true);
    setOrgMsg(null);
    try {
      await auth.updateOrganisation(org);
      await refreshUser();
      setOrgMsg({ type: "success", text: "Festival mis à jour." });
    } catch (err) {
      setOrgMsg({ type: "error", text: err instanceof ApiError ? err.message : "Erreur." });
    } finally { setOrgLoading(false); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPwMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5180"}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      }).then(async res => {
        if (!res.ok) { const b = await res.json(); throw new Error(b.message); }
      });
      setPasswords({ current: "", next: "", confirm: "" });
      setPwMsg({ type: "success", text: "Mot de passe modifié." });
    } catch (err: any) {
      setPwMsg({ type: "error", text: err.message || "Erreur." });
    } finally { setPwLoading(false); }
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-bg-alt py-10">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-primary">Mon profil</h1>
          <p className="text-gray-500 mt-1">Gérez les informations de votre compte et de votre festival.</p>
        </div>

        {/* Compte */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-primary" /> Votre compte
          </h2>
          <form onSubmit={saveAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={account.email} onChange={e => setAccount(a => ({ ...a, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={account.phone} onChange={e => setAccount(a => ({ ...a, phone: e.target.value }))}
                  placeholder="+41 79 123 45 67"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            {accountMsg && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${accountMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {accountMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {accountMsg.text}
              </div>
            )}
            <button type="submit" disabled={accountLoading}
              className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50">
              {accountLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>

        {/* Festival */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Building className="w-5 h-5 text-green-primary" /> Votre festival
          </h2>
          <form onSubmit={saveOrg} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du festival</label>
              <input type="text" required value={org.name} onChange={e => setOrg(o => ({ ...o, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone festival</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={org.phone} onChange={e => setOrg(o => ({ ...o, phone: e.target.value }))}
                    placeholder="+41 22 123 45 67"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={org.city} onChange={e => setOrg(o => ({ ...o, city: e.target.value }))}
                    placeholder="Genève"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="url" value={org.website} onChange={e => setOrg(o => ({ ...o, website: e.target.value }))}
                  placeholder="https://votrefestival.ch"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea value={org.description} onChange={e => setOrg(o => ({ ...o, description: e.target.value }))}
                  placeholder="Décrivez votre festival..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm resize-none" />
              </div>
            </div>
            {orgMsg && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${orgMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {orgMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {orgMsg.text}
              </div>
            )}
            <button type="submit" disabled={orgLoading}
              className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50">
              {orgLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>

        {/* Mot de passe */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-primary" /> Changer le mot de passe
          </h2>
          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required minLength={8} value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                  placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            {pwMsg && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${pwMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {pwMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {pwMsg.text}
              </div>
            )}
            <button type="submit" disabled={pwLoading}
              className="bg-green-primary text-white hover:bg-green-darker py-2.5 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50">
              {pwLoading ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
