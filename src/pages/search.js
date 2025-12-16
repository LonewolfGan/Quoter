import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { QuoteSection } from "../components/QuoteSection";
import { useGet } from "../hooks/useGet";
export const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const { data } = useGet({ query: query });
  return (
    <main className="min-h-screen p-8">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
      >
        ← Retour
      </button>

      <h1 className="text-4xl font-bold mb-15 text-center">
        Resultas pour " {query} "
      </h1>
      {data === null ? null : data.length > 0 ? (
        <QuoteSection query={query} />
      ) : (
        <div className="mt-12 p-6 bg-white rounded-2xl border-2 border-black">
          <h3 className="text-xl font-bold mb-4">Suggestions :</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Vérifiez l'orthographe des mots-clés</li>
            <li>• Essayez des termes plus généraux</li>
            <li>• Essayez avec moins de mots</li>
            <li>
              • Parcourez nos{" "}
              <Link to="/categories" className="underline font-semibold">
                catégories
              </Link>{" "}
              ou{" "}
              <Link to="/authors" className="underline font-semibold">
                auteurs
              </Link>
            </li>
          </ul>
        </div>
      )}
    </main>
  );
};
