"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, CheckCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    window.location.href = `mailto:info@sharenspare.com?subject=Inscription%20newsletter&body=Email%20%3A%20${encodeURIComponent(email)}`;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  const linkClass = "text-gray-600 hover:text-orange-accent transition-colors";

  return (
    <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Top: logo + newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <Link href="/" className="block mb-6">
              <Image src="/mascotte.webp" alt="ShareNSpare" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <p className="text-gray-600 mb-6 max-w-md">
              ShareNSpare connecte festivals, associations et professionnels pour mutualiser le matériel événementiel en Suisse.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} aria-label={label} className="w-10 h-10 bg-gray-200 hover:bg-green-primary/20 rounded-full flex items-center justify-center text-gray-600 hover:text-green-primary transition-colors cursor-default">
                  <Icon className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Restez informé</h3>
            <p className="text-gray-600 mb-4 text-sm">Abonnez-vous pour recevoir les dernières nouvelles de ShareNSpare.</p>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-primary shrink-0" />
                <div>
                  <p className="text-green-primary font-medium text-sm">Merci pour votre inscription !</p>
                  <p className="text-green-primary/70 text-xs">Vous recevrez bientôt nos actualités.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-primary/20 focus:border-green-primary text-sm"
                />
                <button type="submit" className="bg-green-primary text-white px-6 py-2 rounded-lg hover:bg-green-darker transition-colors whitespace-nowrap text-sm font-semibold">
                  S&apos;abonner
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle: sitemap */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-t border-gray-200 pt-10">
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Plateforme</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className={linkClass}>Accueil</Link></li>
              <li><Link href="/login" className={linkClass}>Se connecter</Link></li>
              <li><Link href="/catalogue" className={linkClass}>Catalogue</Link></li>
              <li><Link href="/demande-acces" className={linkClass}>Demander un accès</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Fonctionnalités</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/equipments" className={linkClass}>Mes équipements</Link></li>
              <li><Link href="/reservations" className={linkClass}>Réservations</Link></li>
              <li><Link href="/dashboard" className={linkClass}>Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">À propos</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:info@sharenspare.com" className={linkClass}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-800">Informations légales</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/legal#conditions" className={linkClass}>Conditions d&apos;utilisation</Link></li>
              <li><Link href="/legal#confidentialite" className={linkClass}>Politique de confidentialité</Link></li>
              <li><Link href="/legal#mentions-legales" className={linkClass}>Mentions légales</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-600">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p>&copy; {currentYear} ShareNSpare. Tous droits réservés.</p>
            <p>By 404Production</p>
            <p>Siège social : Genève, Suisse</p>
          </div>
          <div className="flex gap-6">
            <Link href="/legal#confidentialite" className={linkClass}>Confidentialité</Link>
            <Link href="/legal#conditions" className={linkClass}>Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
