"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { auth, ApiError } from "@/lib/api";
import { Mail, Lock, Globe, Phone, MapPin, AlignLeft, Users, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

const FESTIVAL_SIZES = [
  { value: "< 1 000 personnes", label: "< 1 000 personnes" },
  { value: "1 000 – 5 000 personnes", label: "1 000 – 5 000 personnes" },
  { value: "5 000 – 20 000 personnes", label: "5 000 – 20 000 personnes" },
  { value: "+ 20 000 personnes", label: "+ 20 000 personnes" },
];

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token");

  const [form, setForm] = useState({
    email: "",
    password: "",
    organisationName: "",
    phone: "",
    website: "",
    city: "",
    description: "",
    festivalSize: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invLoading, setInvLoading] = useState(true);

  useEffect(() => {
    if (!invitationToken) { setInvLoading(false); return; }
    auth.getInvitation(invitationToken)
      .then(inv => setForm(f => ({ ...f, email: inv.email, organisationName: inv.organisationName })))
      .catch(() => {})
      .finally(() => setInvLoading(false));
  }, [invitationToken]);

  if (!invitationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-alt">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center max-w-md">
          <ShieldCheck className="w-12 h-12 text-green-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès sur invitation</h1>
          <p className="text-gray-600 mb-6">ShareNSpare est réservé aux festivals et professionnels invités.</p>
          <Link href="/login" className="text-green-primary font-semibold hover:underline text-sm">Déjà un compte ? Se connecter</Link>
        </div>
      </div>
    );
  }

  if (invLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, invitationToken: invitationToken ?? undefined });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

          {/* Colonne gauche — formulaire */}
          <div className="p-8 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold text-orange-accent uppercase tracking-wide mb-1">Bienvenue sur ShareNSpare</p>
              <h1 className="text-2xl font-bold text-green-primary leading-tight">
                {form.organisationName ? `Bonjour, ${form.organisationName} 👋` : "Créez votre compte festival"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">Complétez votre profil pour rejoindre la plateforme.</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1 — Votre compte */}
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Votre compte</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" required value={form.email} onChange={update("email")}
                        placeholder="contact@votrefestival.ch"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="password" required minLength={8} value={form.password} onChange={update("password")}
                        placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 — Votre festival */}
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Votre festival</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du festival</label>
                    <input type="text" required value={form.organisationName} onChange={update("organisationName")}
                      placeholder="Festival XYZ"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={form.phone} onChange={update("phone")}
                          placeholder="+41 79 123 45 67"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={form.city} onChange={update("city")}
                          placeholder="Genève"
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="url" value={form.website} onChange={update("website")}
                        placeholder="https://votrefestival.ch"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 — À propos */}
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">À propos</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taille du festival</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select value={form.festivalSize} onChange={update("festivalSize")}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm text-gray-700 appearance-none">
                        <option value="">Sélectionnez une taille</option>
                        {FESTIVAL_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optionnel)</span></label>
                    <div className="relative">
                      <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea value={form.description} onChange={update("description")}
                        placeholder="Décrivez votre festival en quelques mots..."
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none text-sm resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-green-primary text-white hover:bg-green-darker transition-colors font-semibold py-3 rounded-full shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? "Inscription..." : <><span>Rejoindre ShareNSpare</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Déjà un compte ? <Link href="/login" className="text-green-primary font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>

          {/* Colonne droite — visuel */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-green-primary p-10 gap-8">
            <Image src="/mascotte.webp" alt="ShareNSpare" width={180} height={180} className="drop-shadow-xl" unoptimized />
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-3">La plateforme des festivals suisses</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Rejoignez le réseau de festivals qui mutualisent leur matériel pour réduire les coûts et l'impact environnemental.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
