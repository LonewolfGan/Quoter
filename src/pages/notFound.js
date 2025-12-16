import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, BookOpen } from "lucide-react";
import { useTitle } from "../hooks";

export const NotFound = () => {
  const navigate = useNavigate();
  useTitle({ title: "404 - Page introuvable - Quoter" });

  return (
    <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Numéro 404 stylisé */}
        <div className="mb-8 relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-black dark:text-white leading-none opacity-10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-black dark:border-white rounded-full flex items-center justify-center">
              <Search
                size={64}
                strokeWidth={1.5}
                className="text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            Page introuvable
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Citation inspirante */}
        <div className="mb-12 p-6 border-2 border-black dark:border-white rounded-2xl bg-gray-50 dark:bg-gray-900">
          <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-2">
            "Se perdre, c'est parfois le meilleur moyen de se retrouver."
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">— Anonyme</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black dark:border-white rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>

          <Link
            to="/"
            state={{ preventScroll: true }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold"
          >
            <Home size={20} />
            <span>Accueil</span>
          </Link>

          <Link
            to="/blog"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black dark:border-white rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-semibold"
          >
            <BookOpen size={20} />
            <span>Blog</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
