import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, MapPin, Shield, Zap, TrendingUp, Euro, Mic, Lightbulb, Warehouse, Armchair, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 lg:min-h-screen flex items-center bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Colonne texte */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-green-primary leading-tight text-center lg:text-left">
                Et si les festivals suisses devenaient{" "}
                <span className="text-orange-accent font-extrabold">partenaires </span>
                plutôt que{" "}
                <span className="text-orange-accent font-extrabold">concurrents ?</span>
              </h1>

              <p className="text-xl md:text-2xl text-green-primary/80 text-center lg:text-left">
                La première plateforme suisse de location de matériel entre festivals.
              </p>

              {/* Image mobile */}
              <div className="flex lg:hidden justify-center">
                <Image
                  src="/hero.webp"
                  alt="Festival suisse"
                  width={600}
                  height={260}
                  unoptimized
                  className="rounded-xl shadow-xl w-5/6 max-h-64 object-cover mx-auto"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 items-center lg:items-start">
                <Link href="/login" className="w-11/12 sm:w-auto bg-green-primary text-white hover:bg-orange-accent transition-colors font-semibold py-3 px-8 rounded-full shadow-md inline-flex items-center justify-center gap-2">
                  Se connecter <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/demande-acces" className="w-11/12 sm:w-auto border-2 border-green-primary text-green-primary hover:bg-green-primary hover:text-white transition-colors font-semibold py-3 px-8 rounded-full inline-flex items-center justify-center">
                  Demander un accès
                </Link>
              </div>
            </div>

            {/* Image desktop */}
            <div className="hidden lg:flex justify-end">
              <Image
                src="/hero.webp"
                alt="Festival suisse"
                width={600}
                height={500}
                unoptimized
                className="rounded-xl shadow-2xl max-h-125 object-cover"
              />
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: Mic, title: "Systèmes son", desc: "Enceintes professionnelles, consoles, amplificateurs." },
              { icon: Lightbulb, title: "Éclairages scéniques", desc: "Projecteurs LED, spots et poursuites, effets lumineux." },
              { icon: Warehouse, title: "Structures & tentes", desc: "Chapiteaux, scènes modulaires." },
              { icon: Armchair, title: "Mobilier événementiel", desc: "Bancs, tables, bars, mobilier VIP." },
              { icon: ShieldCheck, title: "Barrières & sécurité", desc: "Barrières de sécurité, contrôle d'accès, signalétique." },
              { icon: Zap, title: "Électricité & énergie", desc: "Groupes électrogènes, câblage, distribution." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-bg-alt rounded-xl p-6 hover:bg-[rgba(0,97,58,0.08)] transition-colors">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                  <Icon className="w-5 h-5 text-green-primary" />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
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
