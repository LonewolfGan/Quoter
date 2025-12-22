import { useDownload, useShare, useTitle } from "../hooks/index";
import { useQuote } from "../context/QuoteContext";

import {
  Share2,
  Download,
  Sparkles,
  CircleFadingPlus,
  LibraryBig,
} from "lucide-react";

export const Home = () => {
  const { dailyQuote, isLoading } = useQuote();
  const { handleDownload } = useDownload();
  const { handleShare } = useShare();
  const title = "Quoter - Home";
  useTitle({ title });
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
  const imageUrl = `https://res.cloudinary.com/dbkjpn2db/image/upload/quote_images/${dailyQuote.id}`;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      {/* HEADER */}
      <div className="text-center mb-12">
        <div className="inline-block px-6 py-2 bg-black text-white rounded-full text-lg font-semibold mb-4">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Citation du Jour
        </h1>
        <p className="text-xl text-gray-600">
          Une dose d'inspiration pour bien commencer la journée
        </p>
      </div>

      {/* CITATION CARD */}
      <div className="flex flex-col items-center justify-center border-2 border-black rounded-xl mb-12 mx-2">
        {/* IMAGE */}
        <div className="p-2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] box-border">
          <img
            className="w-full h-full object-cover border-2 border-black rounded-xl"
            loading="lazy"
            src={imageUrl}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.webp";
            }}
            alt={dailyQuote.quote_text}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-row items-center justify-between w-[95%] m-3 p-3 border-2 border-black rounded-xl">
          {/* PARTAGER */}
          <button
            onClick={() => handleShare(imageUrl)}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-xl border-2 border-black hover:bg-black hover:text-white transition-all font-medium"
          >
            <Share2 size={48} strokeWidth={1} />
            <span className="hidden sm:inline">Partager</span>
          </button>

          {/* TÉLÉCHARGER */}
          <button
            onClick={() => handleDownload(imageUrl)}
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-xl border-2 border-black hover:bg-black hover:text-white transition-all font-medium"
          >
            <Download size={48} strokeWidth={1} />
            <span className="hidden sm:inline">Télécharger</span>
          </button>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl w-full">
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-black p-6 text-center">
          <div className="text-4xl mb-3">
            <CircleFadingPlus size={48} strokeWidth={1} />
          </div>
          <h3 className="text-lg font-bold mb-2">Une nouvelle citation</h3>
          <p className="text-gray-600">Chaque jour</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-black p-6 text-center">
          <div className="text-4xl mb-3">
            <LibraryBig size={48} strokeWidth={1} />
          </div>
          <h3 className="text-lg font-bold mb-2">+ de 5000 citations</h3>
          <p className="text-gray-600">Dans notre collection</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2  border-black p-6 text-center">
          <div className="text-4xl mb-3">
            <Sparkles size={48} strokeWidth={1} />
          </div>
          <h3 className="text-lg font-bold mb-2">Inspiration quotidienne</h3>
          <p className="text-gray-600">Inspirez-vous chaque jour</p>
        </div>
      </div>
    </main>
  );
};
