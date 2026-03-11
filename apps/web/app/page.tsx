import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, MapPin, Shield, Zap, Package, TrendingUp, Euro } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-screen flex items-center bg-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-primary mb-6 leading-tight">
                Une plateforme professionnelle de location de matériel pour{" "}
                <span className="text-orange-accent">l&apos;événementiel suisse</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                ShareNSpare connecte festivals, associations et professionnels afin de mutualiser le matériel événementiel en Suisse. Optimisez vos coûts et valorisez pleinement vos équipements dans un cadre sécurisé et professionnel.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="bg-green-primary text-white hover:bg-orange-accent transition-colors font-semibold py-3 px-8 rounded-full shadow-lg inline-flex items-center gap-2">
                  Se connecter à la plateforme <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/demande-acces" className="border-2 border-green-primary text-green-primary hover:bg-green-primary hover:text-white transition-colors font-semibold py-3 px-8 rounded-full">
                  Demander un accès
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/hero.webp"
                  alt="ShareNSpare - Matériel événementiel"
                  width={600}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-bg-alt">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-green-primary text-center mb-4">
            Pourquoi <span className="text-orange-accent">ShareNSpare</span>
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Une plateforme conçue pour favoriser la mutualisation des ressources et renforcer la collaboration entre acteurs de l&apos;événementiel suisse.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: "Éco-responsable", desc: "Réduisez l'achat de matériel neuf en mutualisant les ressources existantes entre organisations." },
              { icon: TrendingUp, title: "Optimisation des investissements", desc: "Transformez votre matériel inutilisé en source de revenu complémentaire et optimisez la rentabilité de vos investissements." },
              { icon: Zap, title: "Simple & rapide", desc: "Publiez votre matériel en quelques clics et trouvez rapidement les équipements dont vous avez besoin." },
              { icon: Shield, title: "Fiable & sécurisé", desc: "Organisations vérifiées, suivi des réservations et paiements sécurisés." },
              { icon: MapPin, title: "Local", desc: "Privilégiez les échanges entre acteurs de l'événementiel de votre région." },
              { icon: Euro, title: "Optimisation des coûts", desc: "Permet aux organisations d'accéder à du matériel professionnel à coût maîtrisé." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[rgba(0,97,58,0.08)] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-primary" />
                </div>
                <h3 className="text-xl font-bold text-green-primary mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exemples de matériel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-green-primary text-center mb-4">
            Exemples de <span className="text-orange-accent">matériel disponible</span>
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Des équipements professionnels pour tous types d&apos;événements en Suisse.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🎪", label: "Scènes & podiums" },
              { icon: "🔊", label: "Sonorisation" },
              { icon: "💡", label: "Éclairage" },
              { icon: "⛺", label: "Tentes & structures" },
              { icon: "🪑", label: "Mobilier" },
              { icon: "⚡", label: "Électricité" },
              { icon: "🛡️", label: "Barrières & sécurité" },
              { icon: "🍺", label: "Restauration" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-bg-alt rounded-xl p-6 text-center hover:bg-[rgba(0,97,58,0.08)] transition-colors">
                <div className="text-4xl mb-3">{icon}</div>
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-primary text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Rejoignez le réseau <span className="text-orange-accent">ShareNSpare</span>
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez la plateforme et commencez à mutualiser vos équipements avec d&apos;autres acteurs de l&apos;événementiel en Suisse.
          </p>
          <Link href="/demande-acces" className="bg-white text-green-primary hover:bg-gray-100 transition-colors font-semibold py-3 px-8 rounded-full shadow-lg inline-flex items-center gap-2">
            Demander un accès <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
