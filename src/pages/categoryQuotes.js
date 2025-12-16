import { useParams, useNavigate } from "react-router-dom";
import { QuoteSection } from "../components/QuoteSection";

export const CategoryQuotes = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  return (
    <main className="min-h-screen p-8">
      <button
        onClick={() => navigate("/categories")}
        className="mb-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
      >
        ← Retour
      </button>

      <h1 className="text-4xl font-bold mb-15 text-center">{slug}</h1>
      <QuoteSection category={slug} />
    </main>
  );
};
