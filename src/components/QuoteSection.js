import { useGet } from "../hooks/useGet";
import { useState, useEffect, useMemo } from "react";
import { useDownload } from "../hooks/useDownload";
import { useShare } from "../hooks/useShare";
import {
  getDisplayUrl,
  getSquareUrl,
  getDisplaySrcSet,
  getSquareSrcSet,
} from "../utils/imageHelper";
import { ResponsiveImage } from "./ResponsiveImage";
import { QuoteModal } from "./QuoteModal";

export const QuoteSection = ({
  query,
  name,
  category,
  data: externalData,
  isLoading: externalLoading,
  fetchEnabled = true,
}) => {
  const [thumbSize, setThumbSize] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 ? 280 : 350,
  );
  const { data: fetchedData, isLoading: fetchedLoading } = useGet({
    query,
    name,
    category,
    enabled: fetchEnabled,
  });
  const data = fetchEnabled ? fetchedData : externalData;
  const isLoading = fetchEnabled ? fetchedLoading : (externalLoading ?? false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth < 768 ? 4 : 8,
  );
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(null);

  const handleDownload = useDownload();
  const handleShare = useShare();

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setItemsPerPage(isMobile ? 4 : 8);
      setThumbSize(isMobile ? 280 : 350);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedQuoteIndex(null);
      }
    };
    if (selectedQuoteIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedQuoteIndex]);

  const allUniqueQuotes = useMemo(() => {
    return data
      ? Array.from(
          new Map(
            data.map((q) => [q.quote_text?.trim().toLowerCase(), q]),
          ).values(),
        )
      : [];
  }, [data]);

  const totalItems = Math.ceil(allUniqueQuotes.length / itemsPerPage);

  const paginatedQuotes = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = page * itemsPerPage;
    return allUniqueQuotes.slice(start, end);
  }, [page, itemsPerPage, allUniqueQuotes]);

  const currentQuote =
    selectedQuoteIndex !== null ? allUniqueQuotes[selectedQuoteIndex] : null;

  // Optimized URL for Modal using image helper
  const currentImageUrl = currentQuote ? getDisplayUrl(currentQuote.id) : null;
  const currentImageSrcSet = currentQuote
    ? getDisplaySrcSet(currentQuote.id, [700, 1200, 1600])
    : "";

  // Preload next and previous images
  useEffect(() => {
    if (selectedQuoteIndex !== null && allUniqueQuotes.length > 0) {
      const preloadIndices = [selectedQuoteIndex + 1, selectedQuoteIndex - 1];
      preloadIndices.forEach((index) => {
        if (index >= 0 && index < allUniqueQuotes.length) {
          const item = allUniqueQuotes[index];
          const img = new Image();
          img.src = getDisplayUrl(item.id);
        }
      });
    }
  }, [selectedQuoteIndex, allUniqueQuotes]);

  return isLoading ? (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  ) : (
    <div className="border rounded-xl border-black my-10 pb-10">
      <div className="flex justify-center items-center gap-6 my-10">
        <button
          type="button"
          aria-label="Page précédente"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-black
               disabled:opacity-20 disabled:cursor-not-allowed
               hover:bg-black hover:text-white hover:scale-110 active:scale-90 transition-all duration-300 shadow-md"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-gray-600 font-medium">
          Page {page} / {totalItems}
        </span>
        <button
          type="button"
          aria-label="Page suivante"
          onClick={() => setPage((p) => Math.min(p + 1, totalItems))}
          disabled={page >= totalItems}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-black
               disabled:opacity-20 disabled:cursor-not-allowed
               hover:bg-black hover:text-white hover:scale-110 active:scale-90 transition-all duration-300 shadow-md"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className=" flex flex-wrap justify-center gap-5 m-2">
        {paginatedQuotes &&
          paginatedQuotes.map((quote, index) => (
            <div
              key={`${page}-${quote.id}-${index}`}
              className="border border-black rounded-xl flex items-center justify-center overflow-hidden bg-white w-[45%] md:w-[350px] aspect-square"
            >
              <ResponsiveImage
                src={getSquareUrl(quote.id, thumbSize)}
                srcSet={getSquareSrcSet(quote.id, [200, 280, 350])}
                sizes="(max-width: 768px) 45vw, 350px"
                width={thumbSize}
                height={thumbSize}
                onError={(e) => {
                  if (!e.currentTarget.src.includes("quote_images")) {
                    // Fallback to default URL
                    e.currentTarget.src = getDisplayUrl(quote.id);
                  } else {
                    // Last resort - use placeholder
                    e.currentTarget.src = "/placeholder.webp";
                    e.currentTarget.onerror = null;
                  }
                }}
                onClick={() => {
                  const actualIndex = (page - 1) * itemsPerPage + index;
                  setSelectedQuoteIndex(actualIndex);
                }}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                alt=""
              />
            </div>
          ))}
      </div>

      <QuoteModal
        isOpen={selectedQuoteIndex !== null && Boolean(currentImageUrl)}
        onClose={() => setSelectedQuoteIndex(null)}
        currentImageUrl={currentImageUrl}
        currentImageSrcSet={currentImageSrcSet}
        currentQuote={currentQuote}
        selectedQuoteIndex={selectedQuoteIndex}
        totalQuotes={allUniqueQuotes.length}
        onPrev={() => setSelectedQuoteIndex((prev) => (prev > 0 ? prev - 1 : prev))}
        onNext={() =>
          setSelectedQuoteIndex((prev) =>
            prev < allUniqueQuotes.length - 1 ? prev + 1 : prev,
          )
        }
        onShare={handleShare}
        onDownload={handleDownload}
      />
    </div>
  );
};
