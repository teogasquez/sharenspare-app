import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white py-16 mt-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-green-primary text-sm font-medium mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-green-primary text-center">
          Informations Légales
        </h1>

        {/* Politique de confidentialité */}
        <section id="confidentialite" className="mb-16 scroll-mt-24">
          <div className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-primary">Politique de Confidentialité</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">1. Introduction</h3>
                <p>La présente politique de confidentialité explique comment ShareNSpare collecte, utilise et protège votre adresse email lorsque vous vous inscrivez à notre newsletter pour être informé du lancement de notre application.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">2. Données collectées</h3>
                <p>Nous collectons uniquement votre <strong>adresse email</strong> lorsque vous vous inscrivez pour être tenu informé du lancement de notre plateforme.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">3. Utilisation des données</h3>
                <p className="mb-2">Votre adresse email est utilisée exclusivement pour :</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Vous informer de l&apos;avancement du développement de ShareNSpare</li>
                  <li>Vous notifier du lancement officiel de l&apos;application</li>
                  <li>Vous envoyer des informations importantes concernant le projet</li>
                </ul>
                <p className="mt-2"><strong>Nous ne vendons, ne louons et ne partageons jamais votre email avec des tiers.</strong></p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">4. Base juridique</h3>
                <p>Le traitement de votre email est basé sur votre <strong>consentement explicite</strong> lors de votre inscription à la newsletter.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">5. Conservation des données</h3>
                <p>Votre adresse email est conservée jusqu&apos;au lancement de l&apos;application, puis jusqu&apos;à ce que vous vous désinscriviez de notre newsletter ou que vous créiez un compte utilisateur.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">6. Vos droits</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Droit d&apos;accès :</strong> Vous pouvez demander quelles données nous avons sur vous</li>
                  <li><strong>Droit de rectification :</strong> Vous pouvez corriger votre email</li>
                  <li><strong>Droit à l&apos;effacement :</strong> Vous pouvez demander la suppression de votre email</li>
                  <li><strong>Droit de retrait :</strong> Vous pouvez vous désinscrire à tout moment</li>
                </ul>
                <p className="mt-3">Pour exercer ces droits, contactez-nous à : <strong>info@sharenspare.com</strong></p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">7. Sécurité</h3>
                <p>Nous utilisons des mesures de sécurité appropriées pour protéger votre adresse email contre tout accès non autorisé, perte ou divulgation.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">8. Prestataire email</h3>
                <p>Pour l&apos;envoi de nos emails, nous utilisons un service tiers sécurisé qui respecte les normes européennes de protection des données (RGPD).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Conditions d'utilisation */}
        <section id="conditions" className="mb-16 scroll-mt-24">
          <div className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-primary">Conditions d&apos;Utilisation</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">1. Inscription à la newsletter</h3>
                <p>En vous inscrivant à notre newsletter, vous acceptez de recevoir des emails de la part de ShareNSpare concernant le développement et le lancement de notre plateforme.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">2. Fréquence des emails</h3>
                <p>Nous nous engageons à ne vous envoyer que des informations pertinentes et importantes. Nous limiterons nos envois pour ne pas encombrer votre boîte mail.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">3. Désinscription</h3>
                <p>Vous pouvez vous désinscrire à tout moment en cliquant sur le lien présent dans chaque email ou en nous contactant à info@sharenspare.com.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">4. Utilisation du site web</h3>
                <p>L&apos;utilisation de ce site web est soumise aux lois suisses. En naviguant sur notre site, vous acceptez de respecter ces conditions.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">5. Propriété intellectuelle</h3>
                <p>Tout le contenu de ce site (textes, images, logos) appartient à ShareNSpare et est protégé par les droits d&apos;auteur. Toute reproduction sans autorisation est interdite.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">6. Modifications</h3>
                <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront publiées sur cette page avec la date de mise à jour.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mentions légales */}
        <section id="mentions-legales" className="mb-16 scroll-mt-24">
          <div className="bg-gray-50 rounded-xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-primary">Mentions Légales</h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">Éditeur du site</h3>
                <p>
                  <strong>Nom :</strong> ShareNSpare<br />
                  <strong>Statut :</strong> Projet en cours de développement<br />
                  <strong>Localisation :</strong> Suisse<br />
                  <strong>Email :</strong> info@sharenspare.com
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">Fondateurs</h3>
                <p>
                  <strong>Simon</strong> – Co-fondateur &amp; Stratégie<br />
                  <strong>Teo</strong> – Co-fondateur &amp; Développement
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">Hébergement</h3>
                <p>
                  <strong>Hébergeur :</strong> Render, Inc.<br />
                  <strong>Site web :</strong> <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="text-green-primary hover:underline">www.render.com</a>
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">Propriété intellectuelle</h3>
                <p>L&apos;ensemble du contenu de ce site (textes, images, logos, design) est la propriété de ShareNSpare. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">Cookies</h3>
                <p>Ce site utilise uniquement des cookies essentiels au fonctionnement du site. Aucun cookie de tracking ou publicitaire n&apos;est utilisé.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-green-primary">Contact</h3>
                <p><strong>Email :</strong> info@sharenspare.com</p>
              </div>
              <div className="pt-6 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-CH", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
