import { getShareFileName } from "../utils/imageHelper";

export const useShare = () => {
  const getExtensionFromMime = (mimeType = "") => {
    const map = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    };
    return map[mimeType] || "png";
  };

  const buildFileName = (quote, mimeType) => {
    const rawName = quote ? getShareFileName(quote) : "quote.png";
    const baseName = rawName.replace(/\.[^.]+$/, "");
    const extension = getExtensionFromMime(mimeType);
    return `${baseName}.${extension}`;
  };

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
      const mimeType = blob.type || "image/png";
      const fileName = buildFileName(quote, mimeType);
      const fileObj = new File([blob], fileName, { type: mimeType });
      const shareText = quote?.quote_text || "Regarde cette superbe citation !";

      // Vérifier si le Web Share API est disponible
      if (navigator.share) {
        const supportsFileShare =
          typeof navigator.canShare === "function"
            ? navigator.canShare({ files: [fileObj] })
            : true;

        if (supportsFileShare) {
          await navigator.share({
            title: "Quoter App",
            text: shareText,
            files: [fileObj],
          });
          return;
        }
      }

      // Fallback prioritaire: copier l'image (pas le lien) dans le presse-papiers
      if (
        window.isSecureContext &&
        navigator.clipboard &&
        typeof window.ClipboardItem !== "undefined"
      ) {
        const clipboardItem = new window.ClipboardItem({ [mimeType]: blob });
        await navigator.clipboard.write([clipboardItem]);
        alert("L'image a été copiée dans votre presse-papiers.");
        return;
      }

      // Fallback secondaire: partage URL de l'image
      if (navigator.share) {
        const canShareUrl =
          typeof navigator.canShare === "function"
            ? navigator.canShare({ url: imageUrl })
            : true;

        if (canShareUrl) {
          await navigator.share({
            title: "Quoter App",
            text: shareText,
            url: imageUrl,
          });
          return;
        }
      }

      // Fallback : copier le lien
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(imageUrl);
        alert("Le lien a été copié dans votre presse-papiers!");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sharing:", error);
      }
      // Fallback final : copier le lien
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(imageUrl);
          alert("Le lien a été copié dans votre presse-papiers!");
        }
      } catch (clipboardError) {
        alert("Erreur lors du partage. Veuillez réessayer.");
      }
    }
  };

  return share;
};
