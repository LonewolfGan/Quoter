import { Link } from "react-router-dom";
import { ClipboardPen, ScrollText, Sparkles, Target } from "lucide-react";
import authors from "../../assets/authors";

export const FeaturedArticle = ({ dailyArticle, normalize }) => {
  if (!dailyArticle) return null;

  const matchedAuthor = authors.find(
    (a) => normalize(a.name) === normalize(dailyArticle.author)
  );

  const authorLink = matchedAuthor
    ? `/authors/${matchedAuthor.name}`
    : "/authors";

  const hasAuthorMatch = authors.some(
    (a) => normalize(a.name) === normalize(dailyArticle.author)
  );

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <h2 className="text-2xl font-bold border-black border-2 rounded-full px-4 py-2">
          Article du Jour
        </h2>
      </div>

      <div className="bg-white rounded-2xl border-2 border-black overflow-hidden hover:shadow-2xl transition-shadow">
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

        <div className="p-8 space-y-6">
          {dailyArticle.content?.intro && (
            <p className="text-lg text-gray-700 leading-relaxed">
              {dailyArticle.content.intro}
            </p>
          )}

          {dailyArticle.content?.context && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-black">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <ScrollText size={48} strokeWidth={1} />
                Contexte Historique
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {dailyArticle.content.context}
              </p>
            </div>
          )}

          {dailyArticle.content?.points && (
            <div>
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-2">
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

          {dailyArticle.content?.exercise && (
            <div className="bg-gray-100 rounded-xl p-6 border-2 border-black">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardPen size={48} strokeWidth={1} />
                <h3 className="text-xl font-bold">Exercice Pratique</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {dailyArticle.content.exercise}
              </p>
            </div>
          )}

          {dailyArticle.content?.conclusion && (
            <div className="bg-gray-100 rounded-xl p-6 border-2 border-black">
              <div className="flex items-center gap-3 mb-4">
                <Target size={48} strokeWidth={1} />
                <h3 className="text-xl font-bold">Conclusion</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {dailyArticle.content.conclusion}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t-2 border-gray-200 flex-wrap">
            <Link
              to={authorLink}
              className="flex-1 px-6 py-3 bg-black text-white rounded-full hover:bg-white hover:text-black hover:border-2 hover:border-black transition-colors text-center font-semibold w-full"
            >
              Plus de {hasAuthorMatch ? dailyArticle.author : "nos auteurs"}
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
  );
};
