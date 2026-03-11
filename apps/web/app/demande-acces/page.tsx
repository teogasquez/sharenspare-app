"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Clock } from "lucide-react";

export default function DemandeAccesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organisation: "",
    type: "",
    contact: "",
    email: "",
    ville: "",
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Demande d'accès ShareNSpare – ${form.organisation}`);
    const body = encodeURIComponent(
      `Nom de l'organisation : ${form.organisation}\nType : ${form.type}\nContact : ${form.contact}\nEmail : ${form.email}\nVille / Canton : ${form.ville}`
    );
    window.location.href = `mailto:info@sharenspare.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-bg-alt py-20">
      <div className="w-full max-w-lg mx-4">
        <Link href="/" className="inline-flex items-center gap-2 text-green-primary text-sm font-medium mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-green-primary mb-2">Demander un accès</h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            ShareNSpare est réservé aux acteurs de l&apos;événementiel suisse. Merci de compléter les informations ci-dessous afin que nous puissions évaluer votre demande.
          </p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-primary" />
              </div>
              <h2 className="text-xl font-bold text-green-primary mb-2">Demande envoyée !</h2>
              <p className="text-gray-600 text-sm">Nous examinerons votre demande et vous contacterons sous 48h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;organisation *</label>
                <input
                  type="text"
                  required
                  value={form.organisation}
                  onChange={update("organisation")}
                  placeholder="ex: Festival du Lac"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d&apos;organisation *</label>
                <select
                  required
                  value={form.type}
                  onChange={update("type")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Festival">Festival</option>
                  <option value="Association">Association</option>
                  <option value="Organisation étudiante">Organisation étudiante</option>
                  <option value="Jeunesse">Jeunesse</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personne de contact *</label>
                <input
                  type="text"
                  required
                  value={form.contact}
                  onChange={update("contact")}
                  placeholder="Nom et prénom"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail professionnelle *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="contact@votre-organisation.ch"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville / Canton <span className="text-gray-400">(recommandé)</span></label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={update("ville")}
                  placeholder="ex: Genève, GE"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-primary text-white hover:bg-green-darker transition-colors font-semibold py-3 rounded-full shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Faire une demande
              </button>

              <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 mt-2">
                <Clock className="w-3.5 h-3.5" /> Les demandes sont examinées sous 48h.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
