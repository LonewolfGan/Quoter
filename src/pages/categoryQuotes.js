import { useParams, useNavigate } from "react-router-dom";
import { QuoteSection } from "../components/QuoteSection";
import { useTitle } from "../hooks";

export const CategoryQuotes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const title = `Quoter - ${slug}`;
  useTitle({ title });
  
  // Décoder le slug pour l'affichage
  const displayName = decodeURIComponent(slug).replace(/-/g, ' ');

  const handleBack = () => {
    navigate(-1);
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

      <QuoteSection category={slug} />
    </main>
  );
};