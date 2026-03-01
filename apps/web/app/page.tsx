import Link from "next/link";
import { ArrowRight, Handshake, Leaf, MapPin, Shield, Users, Zap, Package } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-screen flex items-center bg-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#00613a] mb-6 leading-tight">
                Partagez votre <span className="text-[#D17034]">materiel</span> evenementiel en <span className="text-[#D17034]">circuit court</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                ShareNSpare connecte festivals, associations et professionnels pour mutualiser le materiel evenementiel en Suisse. Reduisez vos couts, evitez le gaspillage.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/catalogue" className="bg-[#00613a] text-white hover:bg-[#D17034] transition-colors font-semibold py-3 px-8 rounded-full shadow-lg inline-flex items-center gap-2">
                  Decouvrir le catalogue <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="border-2 border-[#00613a] text-[#00613a] hover:bg-[#00613a] hover:text-white transition-colors font-semibold py-3 px-8 rounded-full">
                  Creer un compte
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-[#00613a] to-[#004d2e] rounded-3xl p-10 text-white shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
                    <div><p className="font-bold text-2xl">50+</p><p className="text-white/80 text-sm">Festivals partenaires</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Package className="w-6 h-6" /></div>
                    <div><p className="font-bold text-2xl">1 200+</p><p className="text-white/80 text-sm">Equipements disponibles</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6" /></div>
                    <div><p className="font-bold text-2xl">26</p><p className="text-white/80 text-sm">Cantons couverts</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00613a] text-center mb-4">
            Pourquoi <span className="text-[#D17034]">ShareNSpare</span> ?
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Une plateforme pensee pour l&apos;economie circulaire et la cooperation locale dans l&apos;evenementiel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Leaf, title: "Eco-responsable", desc: "Reduisez l'achat de materiel neuf en mutualisant les ressources existantes entre evenements." },
              { icon: Handshake, title: "Circuit court", desc: "Privilegiez les echanges locaux entre festivals et structures de votre region." },
              { icon: Zap, title: "Simple & rapide", desc: "Publiez votre materiel en quelques clics. Trouvez ce qu'il vous faut instantanement." },
              { icon: Shield, title: "Fiable & securise", desc: "Organisations verifiees, suivi des reservations et paiement securise via Stripe." },
              { icon: MapPin, title: "100% Suisse", desc: "Concu pour le marche suisse avec paiement en CHF et logistique locale." },
              { icon: Users, title: "Communaute", desc: "Rejoignez un reseau de festivals, associations et professionnels engages." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[rgba(0,97,58,0.08)] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#00613a]" />
                </div>
                <h3 className="text-xl font-bold text-[#00613a] mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#00613a] text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pret a <span className="text-[#D17034]">mutualiser</span> ?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez la plateforme et commencez a partager du materiel avec d&apos;autres evenements en Suisse.
          </p>
          <Link href="/register" className="bg-white text-[#00613a] hover:bg-gray-100 transition-colors font-semibold py-3 px-8 rounded-full shadow-lg inline-flex items-center gap-2">
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-lg font-bold text-white">Share<span className="text-[#D17034]">N</span>Spare</p>
          <p className="text-sm">&copy; 2026 ShareNSpare. Prototype - Tous droits reserves.</p>
        </div>
      </footer>
    </div>
  );
}
