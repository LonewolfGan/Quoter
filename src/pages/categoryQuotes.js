import { useParams, useNavigate, useLocation } from "react-router-dom";
import { QuoteSection } from "../components/QuoteSection";
import { useTitle } from "../hooks";
import { useEffect } from "react";

export const CategoryQuotes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const title = `Quoter - ${slug}`;
  useTitle({ title });
  
  // Décoder le slug pour l'affichage (remplacer les tirets par des espaces)
  const displayName = decodeURIComponent(slug).replace(/-/g, ' ');
  
  // Vérifier si on est en mode développement ou production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // En production, s'assurer que le slug est valide
useEffect(() => {
  // Si pas de state (rechargement de page), on redirige vers la page d'accueil
  // qui redirigera vers la bonne catégorie
  if (isProduction && !location.state?.fromInternalNav) {
    navigate(`/?redirect=/category/${slug}`, { replace: true });
  }
}, [isProduction, location.state, navigate, slug]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/categories');
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
      >
        ← Retour
      </button>

      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center capitalize">
        {displayName}
      </h1>
      
      <QuoteSection category={displayName} />
    </main>
  );
};
