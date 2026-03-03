"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { UserPlus, Mail, Lock, User, Phone, Building, AlertCircle, ShieldCheck } from "lucide-react";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token");

  if (!invitationToken) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <ShieldCheck className="w-12 h-12 text-green-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès sur invitation</h1>
        <p className="text-gray-600 mb-6">ShareNSpare est réservé aux festivals et professionnels invités. Pour obtenir un accès, contactez-nous.</p>
        <Link href="/login" className="text-green-primary font-semibold hover:underline text-sm">Déjà un compte ? Se connecter</Link>
      </div>
    );
  }

  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "", organisationName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, organisationName: form.organisationName || undefined, invitationToken: invitationToken || undefined });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-primary mb-2">Créer un <span className="text-orange-accent">compte</span></h1>
        <p className="text-gray-600">{invitationToken ? "Vous avez été invité à rejoindre ShareNSpare" : "Rejoignez la communauté ShareNSpare"}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" required value={form.firstName} onChange={update("firstName")} placeholder="Jean" className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" required value={form.lastName} onChange={update("lastName")} placeholder="Dupont" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" required value={form.email} onChange={update("email")} placeholder="votre@email.ch" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" required minLength={8} value={form.password} onChange={update("password")} placeholder="Minimum 8 caractères" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="tel" required value={form.phone} onChange={update("phone")} placeholder="+41 79 123 45 67" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition" />
          </div>
        </div>
        {!invitationToken && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organisation <span className="text-gray-400">(optionnel)</span></label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.organisationName} onChange={update("organisationName")} placeholder="Nom de votre asso / entreprise" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition" />
            </div>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full bg-green-primary text-white hover:bg-green-darker transition-colors font-semibold py-3 rounded-full shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" />{loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Déjà un compte ? <Link href="/login" className="text-green-primary font-semibold hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-bg-alt py-20">
      <div className="w-full max-w-md mx-4">
        <Suspense fallback={<div className="text-center text-gray-500">Chargement...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </section>
  );
}
