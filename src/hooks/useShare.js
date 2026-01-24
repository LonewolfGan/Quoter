import { getShareFileName } from "../utils/imageHelper";

export const useShare = () => {
  const share = async (imageUrl, quote = null) => {
    try {
      if (!imageUrl || typeof imageUrl !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.error("Invalid image URL:", imageUrl);
        }
        return;
      }

      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error("Image fetch failed");
      }

      const blob = await response.blob();
      const fileName = quote ? getShareFileName(quote) : "quote.png";
      const fileObj = new File([blob], fileName, { type: "image/png" });

      // Vérifier si le Web Share API est disponible
      if (navigator.share && navigator.canShare) {
        // Essayer de partager avec fichier
        if (navigator.canShare({ files: [fileObj] })) {
          await navigator.share({
            title: "Quoter App",
            text: quote?.quote_text || "Regarde cette superbe citation !",
            files: [fileObj],
          });
          return;
        }

        // Fallback : partager avec URL
        if (navigator.canShare({ url: window.location.href })) {
          await navigator.share({
            title: "Quoter App",
            text: quote?.quote_text || "Regarde cette superbe citation !",
            url: window.location.href,
          });
          return;
        }
      }

      // Fallback : copier le lien
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert("Le lien a été copié dans votre presse-papiers!");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sharing:", error);
      }
      // Fallback final : copier le lien
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          alert("Le lien a été copié dans votre presse-papiers!");
        }
      } catch (clipboardError) {
        alert("Erreur lors du partage. Veuillez réessayer.");
      }
    }
  };

  return share;
};
