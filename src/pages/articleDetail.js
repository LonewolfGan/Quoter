import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  ClipboardPen,
  ScrollText,
  Sparkles,
  Target,
  ArrowLeft,
} from "lucide-react";
import authors from "../../public/authors/authors";
import { useTitle, useScrollToTop } from "../hooks/index";

export const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useScrollToTop();
  useTitle({
    title: article ? `${article.title} - Quoter` : "Article - Quoter",
  });

  const normalize = (str) =>
    str
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Article introuvable");
          return;
        }

        setArticle(data);
      } catch (err) {
        console.error("❌ Erreur chargement article:", err);
        setError("Erreur lors du chargement de l'article");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadArticle();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-xl">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">
            {error || "Article introuvable"}
          </p>
          <Link
            to="/blog"
            className="px-6 py-3 bg-black text-white rounded-full  hover:bg-gray-800 transition-colors inline-block"
          >
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 border-black border  text-black rounded-full mb-6 hover:bg-black hover:text-white"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        {/* Article */}
        <article className="bg-white rounded-2xl border-2 border-black overflow-hidden">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-xl text-black p-8 border-b-2 border-black">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-2 bg-gray-100 rounded-full border-black border-2 text-sm font-medium">
                {article.read_time || "6 min"} de lecture
              </span>
              <span className="text-sm text-gray-500">
                {new Date(article.published_date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {article.title}
            </h1>
            <p className="text-xl text-gray-700 mb-6">{article.excerpt}</p>

            {/* Meta info */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-block px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                {article.author}
              </span>
              {article.category && (
                <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium border-2 border-black">
                  {article.category}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Intro */}
            {article.content?.intro && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {article.content.intro}
              </p>
            )}

            {/* Contexte */}
            {article.content?.context && (
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-black">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ScrollText size={24} strokeWidth={1.5} />
                  Contexte Historique
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {article.content.context}
                </p>
              </div>
            )}

            {/* Points clés */}
            {article.content?.points && (
              <div>
                <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-2">
                  <Sparkles size={24} strokeWidth={1.5} />
                  <h2 className="text-xl font-bold">Points Clés</h2>
                </div>
                <ul className="space-y-3">
                  {article.content.points.map((point, i) => (
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
            {article.content?.exercise && (
              <div className="bg-gray-100 rounded-xl p-6 border-2 border-black">
                <div className="flex items-center gap-3 mb-4">
                  <ClipboardPen size={24} strokeWidth={1.5} />
                  <h2 className="text-xl font-bold">Exercice Pratique</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {article.content.exercise}
                </p>
              </div>
            )}

            {/* Conclusion */}
            {article.content?.conclusion && (
              <div className="bg-gray-100 rounded-xl p-6 border-2 border-black">
                <div className="flex items-center gap-3 mb-4">
                  <Target size={24} strokeWidth={1.5} />
                  <h2 className="text-xl font-bold">Conclusion</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {article.content.conclusion}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
              <Link
                to={(() => {
                  const matchedAuthor = authors.find(
                    (a) => normalize(a.name) === normalize(article.author)
                  );
                  return matchedAuthor
                    ? `/authors/${matchedAuthor.name}`
                    : "/authors";
                })()}
                className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-white hover:text-black hover:border-2 hover:border-black transition-colors text-center font-semibold"
              >
                Plus de{" "}
                {authors.some(
                  (a) => normalize(a.name) === normalize(article.author)
                )
                  ? article.author
                  : "nos auteurs"}
              </Link>
              <Link
                to={`/categories/${article.category}`}
                className="flex-1 px-6 py-3 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors text-center font-semibold"
              >
                Catégorie {article.category}
              </Link>
            </div>
          </div>
        </article>

        {/* Bouton retour au blog */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-block px-8 py-3 border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors font-semibold"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ArticleDetail;
