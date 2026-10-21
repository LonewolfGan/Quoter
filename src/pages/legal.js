import { useTitle } from "../hooks";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText } from "lucide-react";

export const PrivacyPolicy = () => {
  useTitle({ title: "Politique de Confidentialité - Quoter" });

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Shield size={32} className="text-black" />
        <h1 className="text-3xl md:text-4xl font-bold">Politique de Confidentialité</h1>
      </div>

      <div className="space-y-6 leading-relaxed bg-white p-8 rounded-2xl border-2 border-black">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Collecte des données</h2>
          <p className="text-gray-600">
            Quoter est une application d'inspiration quotidienne qui respecte votre vie privée. Aucune donnée personnelle nominative n'est collectée sans votre accord explicite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Cookies et traceurs</h2>
          <p className="text-gray-600">
            Nous utilisons des cookies analytiques (Google Analytics 4) uniquement après consentement via notre bandeau de cookies. En cas de refus, aucun traceur n'est activé et vos préférences sont conservées localement dans votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Stockage local</h2>
          <p className="text-gray-600">
            Votre historique de navigation local et la citation du jour peuvent être mis en cache dans le <code>localStorage</code> de votre navigateur pour optimiser les performances et la rapidité d'affichage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Vos droits (RGPD)</h2>
          <p className="text-gray-600">
            Conformément au RGPD, vous pouvez révoquer votre consentement à tout moment en effaçant les cookies de votre navigateur ou en réinitialisant vos préférences.
          </p>
        </section>
      </div>
    </main>
  );
};

export const TermsConditions = () => {
  useTitle({ title: "Conditions d'Utilisation - Quoter" });

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Retour à l'accueil
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} className="text-black" />
        <h1 className="text-3xl md:text-4xl font-bold">Conditions Générales d'Utilisation</h1>
      </div>

      <div className="space-y-6 leading-relaxed bg-white p-8 rounded-2xl border-2 border-black">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Présentation du service</h2>
          <p className="text-gray-600">
            Quoter met à disposition des citations d'auteurs et des articles de réflexion philosophique et historique générés ou sélectionnés pour l'inspiration de ses utilisateurs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Propriété intellectuelle</h2>
          <p className="text-gray-600">
            Les citations historiques relèvent du domaine public. Les analyses et articles originaux proposés sur le site sont fournis sous licence libre d'accès pour un usage personnel et pédagogique.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Responsabilité</h2>
          <p className="text-gray-600">
            Le service est fourni « tel quel », sans garantie d'aucune sorte quant à la disponibilité continue ou l'exhaustivité des informations fournies.
          </p>
        </section>
      </div>
    </main>
  );
};
