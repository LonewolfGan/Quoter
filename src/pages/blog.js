import { supabase } from "../utils/supabaseClient";
import { ClipboardPen, ScrollText, Sparkles, Target } from "lucide-react";
import authors from "../assets/authors";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuote } from "../context/QuoteContext";
import { useTitle } from "../hooks";

export const Blog = () => {
  const { dailyQuote, dailyArticle, isLoading, isGenerating } = useQuote();
  const [allArticles, setAllArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = window.innerWidth < 768 ? 5 : 9;
  const [searchQuery, setSearchQuery] = useState("");
  const title = "Quoter - Blog";
  useTitle({ title });

  const normalize = (str) =>
    str
      .trim()
      .normalize("NFD") // décompose les accents (é → e + ◌́)
      .replace(/[\u0300-\u036f]/g, "") // enlève les accents
      .toLowerCase();
  const loadAllArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAllArticles(data || []);
    } catch (err) {
      console.error("❌ Erreur chargement articles:", err);
    }
  };

  useEffect(() => {
    loadAllArticles();
  }, []);
  useEffect(() => {
    if (dailyArticle && !isGenerating) {
      loadAllArticles();
    }
  }, [dailyArticle, isGenerating]);

  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalize(article.author)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + articlesPerPage
  );

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
      {/* HERO */}
      <div className="text-black ">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Notre Blog</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* ARTICLE DU JOUR */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <h2 className="text-2xl font-bold border-black border-2 rounded-full px-4 py-2">
              Article du Jour
            </h2>
          </div>

          {/* FEATURED ARTICLE */}
          <div className="bg-white rounded-2xl border-2 border-black overflow-hidden hover:shadow-2xl transition-shadow">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-xl text-black p-8 border-b-2 border-black">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-2 bg-white/10 rounded-full border-black border-2 text-sm font-medium">
                  {dailyArticle.read_time} de lecture
                </span>
              </div>
              <h3 className="text-4xl font-bold mb-4">
                {dailyArticle.title.replace(/ (:)/g, "\u00A0$1")}
              </h3>
              <p className="text-xl text-black mb-6">{dailyArticle.excerpt}</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Intro */}
              {dailyArticle.content.intro && (
                <p className="text-lg text-gray-700 leading-relaxed">
                  {dailyArticle.content.intro}
                </p>
              )}

              {/* Contexte */}
              {dailyArticle.content.context && (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-black">
                  <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <ScrollText size={48} strokeWidth={1} />
                    Contexte Historique
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {dailyArticle.content.context}
                  </p>
                </div>
              )}

              {/* Points clés */}
              {dailyArticle.content.points && (
                <div>
                  <div className="flex items-center gap-3  mb-4 border-b-2 border-black pb-2">
                    <Sparkles size={48} strokeWidth={1} />
                    <h3 className="text-xl font-bold">Points Clés</h3>
                  </div>
                  <ul className="space-y-3">
                    {dailyArticle.content.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 pt-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exercice */}
              {dailyArticle.content.exercise && (
                <div className="bg-gray-100 rounded-xl p-6 border-2 border-black">
                  <div className="flex items-center gap-3 mb-4">
                    <ClipboardPen size={48} strokeWidth={1} />
                    <h4 className="text-xl font-bold">Exercice Pratique</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {dailyArticle.content.exercise}
                  </p>
                </div>
              )}

              {/* Conclusion */}
              {dailyArticle.content.conclusion && (
                <div className="bg-gray-100 rounded-xl p-6 border-2 border-black">
                  <div className="flex items-center gap-3 mb-4">
                    <Target size={48} strokeWidth={1} />
                    <h4 className="text-xl font-bold">Conclusion</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {dailyArticle.content.conclusion}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-4 pt-4 border-t-2 border-gray-200 flex-wrap">
                <Link
                  to={(() => {
                    const matchedAuthor = authors.find(
                      (a) =>
                        normalize(a.name) === normalize(dailyArticle.author)
                    );
                    return matchedAuthor
                      ? `/authors/${matchedAuthor.name}`
                      : "/authors";
                  })()}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-white hover:text-black hover:border-2 hover:border-black transition-colors text-center font-semibold w-full"
                >
                  Plus de{" "}
                  {authors.some(
                    (a) => normalize(a.name) === normalize(dailyArticle.author)
                  )
                    ? dailyArticle.author
                    : "nos auteurs"}
                </Link>
                <Link
                  to={`/categories/${dailyArticle.category}`}
                  className="flex-1 px-6 py-3 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors text-center font-semibold w-full"
                >
                  Catégorie {dailyArticle.category}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* TOUS LES ARTICLES */}
        {allArticles.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 border-b-2 border-black pb-4">
              Archive des Articles ({allArticles.length})
            </h2>

            {/* RECHERCHE */}
            <div className="mb-8 space-y-4">
              {/* Barre de recherche */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Rechercher un article, auteur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-3 w-full border-2 border-black rounded-full outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* GRILLE D'ARTICLES */}
            {paginatedArticles.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      <Link
                        key={article.id}
                        to={`/blog/${article.id}`}
                        className="bg-white  overflow-hidden  cursor-pointer group block"
                      >
                        <div className="p-6 h-full">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                article.published_date
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-xs text-gray-500">6 min</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2 group-hover:underline ">
                            {article.title
                              .replace(/ (:)/g, "\u00A0$1")
                              .replace(/ (-)/g, "\u00A0$1")}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                              {article.author}
                            </span>
                            {article.category && (
                              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                                {article.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
                    >
                      ← Précédent
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Affiche seulement quelques pages autour de la page actuelle
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-full border-2 border-black transition-colors ${
                                currentPage === pageNum
                                  ? "bg-black text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-black">
                <p className="text-xl text-gray-600 mb-4">
                  Aucun article trouvé
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Blog;
