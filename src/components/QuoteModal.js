import { ResponsiveImage } from "./ResponsiveImage";

export const QuoteModal = ({
  isOpen,
  onClose,
  currentImageUrl,
  currentImageSrcSet,
  currentQuote,
  selectedQuoteIndex,
  totalQuotes,
  onPrev,
  onNext,
  onShare,
  onDownload,
}) => {
  if (!isOpen || !currentImageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu de la citation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8"
      onClick={onClose}
    >
      {/* PREV BUTTON */}
      <button
        aria-disabled={selectedQuoteIndex === 0}
        aria-label="Citation précédente"
        key={`prev-${selectedQuoteIndex}`}
        className={`absolute left-2 md:left-8 bg-black/40 backdrop-blur-md text-white z-[60] p-1 md:p-4 rounded-full border border-white/20 shadow-2xl transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed ${
          selectedQuoteIndex === 0 ? "" : "pulse-animation"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        disabled={selectedQuoteIndex === 0}
        type="button"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* NEXT BUTTON */}
      <button
        aria-disabled={selectedQuoteIndex === totalQuotes - 1}
        aria-label="Citation suivante"
        key={`next-${selectedQuoteIndex}`}
        className={`absolute right-2 md:right-8 bg-black/40 backdrop-blur-md text-white z-[60] p-1 md:p-4 rounded-full border border-white/20 shadow-2xl transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed ${
          selectedQuoteIndex === totalQuotes - 1 ? "" : "pulse-animation"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        disabled={selectedQuoteIndex === totalQuotes - 1}
        type="button"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* CLOSE BUTTON */}
      <button
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white w-12 h-12 flex items-center justify-center rounded-full border border-white/30 hover:bg-white/20 hover:scale-110 active:scale-90 transition-all duration-300 z-[60] shadow-xl"
        onClick={onClose}
        aria-label="Fermer la vue agrandie"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col gap-4 md:gap-6 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="flex items-center justify-between px-2 py-3 md:px-4 md:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              className="flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl border-2 border-white hover:bg-white/20 transition-colors text-white font-medium"
              aria-label="Partager la citation"
              onClick={() => onShare(currentImageUrl, currentQuote)}
            >
              <svg width="32" height="32" strokeWidth="1.8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-9 md:h-9">
                <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.5 6.5L8.5 10.5" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 13.5L15.5 17.5" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Share
            </button>
          </div>

          <button
            className="flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl border-2 border-white hover:bg-white/20 transition-colors text-white font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(currentImageUrl, currentQuote);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" fill="none" className="w-6 h-6 md:w-7 md:h-7">
              <path d="M42.667 138.667V181.333C42.667 193.116 52.218 202.667 64.000 202.667H192.000C203.782 202.667 213.333 193.116 213.333 181.333V138.667M128.000 64.000V160.000M128.000 160.000L160.000 128.000M128.000 160.000L96.000 128.000" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
