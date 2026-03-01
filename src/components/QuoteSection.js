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

      {selectedQuoteIndex !== null && currentImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8"
          onClick={() => setSelectedQuoteIndex(null)}
        >
          {/* NAVIGATION BUTTONS */}
          <button
            aria-disabled={selectedQuoteIndex === 0}
            aria-label="Citation précédente"
            key={`prev-${selectedQuoteIndex}`}
            className={`absolute left-2 md:left-8 bg-black/40 backdrop-blur-md text-white z-[60] p-1 md:p-4 rounded-full border border-white/20 shadow-2xl transition-all duration-300
    hover:bg-black/80 hover:scale-110 active:scale-90
    disabled:opacity-20 disabled:cursor-not-allowed
    ${selectedQuoteIndex === 0 ? "" : "pulse-animation"}
  `}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedQuoteIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }}
            disabled={selectedQuoteIndex === 0}
            type="button"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            aria-disabled={selectedQuoteIndex === allUniqueQuotes.length - 1}
            aria-label="Citation suivante"
            key={`next-${selectedQuoteIndex}`}
            className={`absolute right-2 md:right-8 bg-black/40 backdrop-blur-md text-white z-[60] p-1 md:p-4 rounded-full border border-white/20 shadow-2xl transition-all duration-300
    hover:bg-black/80 hover:scale-110 active:scale-90
    disabled:opacity-20 disabled:cursor-not-allowed
    ${
      selectedQuoteIndex === allUniqueQuotes.length - 1 ? "" : "pulse-animation"
    }
  `}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedQuoteIndex((prev) =>
                prev < allUniqueQuotes.length - 1 ? prev + 1 : prev,
              );
            }}
            disabled={selectedQuoteIndex === allUniqueQuotes.length - 1}
            type="button"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* CLOSE BUTTON */}
          <button
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white w-12 h-12 flex items-center justify-center rounded-full border border-white/30 hover:bg-white/20 hover:scale-110 active:scale-90 transition-all duration-300 z-[60] shadow-xl"
            onClick={() => setSelectedQuoteIndex(null)}
            aria-label="Close"
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col gap-4 md:gap-6 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* IMAGE */}
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded-xl">
              <ResponsiveImage
                src={currentImageUrl}
                srcSet={currentImageSrcSet}
                sizes="(max-width: 768px) 90vw, 900px"
                width={900}
                height={900}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.webp";
                }}
                alt="Enlarged view"
                className="max-h-full max-w-full object-contain"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>

            {/* ACTION BAR */}
            <div className="flex items-center justify-between px-2 py-3 md:px-4 md:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
              {/* LEFT BUTTONS */}
              <div className="flex items-center gap-4 md:gap-6">
                {/* LIKE */}
                {/*     <button
                  className="p-3 md:p-4 rounded-xl border-2 border-white hover:bg-white/20 transition-colors"
                  aria-label="Like"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 256 256"
                    fill="none"
                    className="w-7 h-7 md:w-9 md:h-9"
                  >
                    <path
                      d="M46.0091 67.0306C27.3303 85.2937 27.3303 114.904 46.0091 133.167L120.543 206.042C124.688 210.095 131.312 210.095 135.457 206.042L209.991 133.167C228.67 114.904 228.67 85.2937 209.991 67.0306C191.312 48.7675 161.028 48.7675 142.349 67.0306L128 81.0603L113.651 67.0306C94.9722 48.7675 64.6879 48.7675 46.0091 67.0306Z"
                      stroke="#ffffff"
                      strokeWidth="14"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
 */}
                {/* SHARE */}
                <button
                  className="flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl border-2 border-white hover:bg-white/20 transition-colors text-white font-medium"
                  aria-label="Share"
                  onClick={() => handleShare(currentImageUrl, currentQuote)}
                >
                  <svg
                    width="32"
                    height="32"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 md:w-9 md:h-9"
                  >
                    <path
                      d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.5 6.5L8.5 10.5"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 13.5L15.5 17.5"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Share
                </button>
              </div>

              {/* DOWNLOAD BUTTON */}
              <button
                className="flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl border-2 border-white hover:bg-white/20 transition-colors text-white font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(currentImageUrl, currentQuote);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 256 256"
                  fill="none"
                  className="w-6 h-6 md:w-7 md:h-7"
                >
                  <path
                    d="M42.667 138.667V181.333C42.667 193.116 52.218 202.667 64.000 202.667H192.000C203.782 202.667 213.333 193.116 213.333 181.333V138.667M128.000 64.000V160.000M128.000 160.000L160.000 128.000M128.000 160.000L96.000 128.000"
                    stroke="#ffffff"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
