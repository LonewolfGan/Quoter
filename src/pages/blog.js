import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuote } from "../context/QuoteContext";
import { useTitle } from "../hooks";
import { FeaturedArticle } from "../components/blog/FeaturedArticle";
import { ArticleCard } from "../components/blog/ArticleCard";

const normalize = (str) =>
  typeof str === "string"
    ? str
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";

export const Blog = () => {
  const { dailyQuote, dailyArticle, isLoading, isGenerating } = useQuote();
  const [allArticles, setAllArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage, setArticlesPerPage] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 ? 5 : 9
  );
  const [searchQuery, setSearchQuery] = useState("");
  useTitle({ title: "Quoter - Blog" });

  const loadAllArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles?limit=50");
      if (!res.ok) throw new Error("Failed to load articles");
      const json = await res.json();
      setAllArticles(json.data || []);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erreur chargement articles:", err);
      }
    }
  }, []);

  useEffect(() => {
    loadAllArticles();
  }, [dailyArticle, isGenerating, loadAllArticles]);

  useEffect(() => {
    const handleResize = () => {
      setArticlesPerPage(window.innerWidth < 768 ? 5 : 9);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredArticles = useMemo(() => {
    if (!allArticles || allArticles.length === 0) return [];
    const queryLower = searchQuery.trim().toLowerCase();
    const queryNorm = normalize(searchQuery || "");
    if (!queryLower) return allArticles;
    return allArticles.filter((article) => {
      const title = article.title?.toLowerCase() || "";
      const excerpt = article.excerpt?.toLowerCase() || "";
      const authorNorm = normalize(article.author || "");
      return (
        title.includes(queryLower) ||
        excerpt.includes(queryLower) ||
        authorNorm.includes(queryNorm)
      );
    });
  }, [allArticles, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice(startIndex, startIndex + articlesPerPage);
  }, [filteredArticles, startIndex, articlesPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading || !dailyQuote) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-xl">Chargement de la citation...</p>
        </div>
      </div>
    );
  }

  if (!dailyArticle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-xl">
            {isGenerating
              ? "Génération de l'article en cours..."
              : "Chargement de l'article..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="text-black">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Notre Blog</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <FeaturedArticle dailyArticle={dailyArticle} normalize={normalize} />

        {allArticles.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 border-b-2 border-black pb-4">
              Archive des Articles ({allArticles.length})
            </h2>

            <div className="mb-8 space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Rechercher un article, auteur..."
                  aria-label="Rechercher dans les articles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-3 w-full border-2 border-black rounded-full outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {paginatedArticles.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors text-sm font-semibold"
                    >
                      Précédent
                    </button>
                    <span className="px-4 text-sm font-semibold">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors text-sm font-semibold"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Aucun article trouvé pour cette recherche.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
