import { Link } from "react-router-dom";

export const ArticleCard = ({ article }) => {
  const formattedDate = article.published_date
    ? new Date(article.published_date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const formattedTitle = (article.title || "")
    .replace(/ (:)/g, "\u00A0$1")
    .replace(/ (-)/g, "\u00A0$1");

  return (
    <div className="bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <Link
        to={`/blog/${article.id}`}
        className="bg-white overflow-hidden cursor-pointer group block"
      >
        <div className="p-6 h-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">{formattedDate}</span>
            <span className="text-xs text-gray-500">
              {article.read_time || "6 min"}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:underline">
            {formattedTitle}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {article.author && (
              <span className="inline-block px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                {article.author}
              </span>
            )}
            {article.category && (
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                {article.category}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
