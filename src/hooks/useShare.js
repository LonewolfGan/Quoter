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

  const isAbortError = (error) => {
    return (
      error?.name === "AbortError" ||
      error?.name === "NotAllowedError" ||
      error?.message?.toLowerCase?.().includes("abort")
    );
  };

  const toPngBlob = async (blob) => {
    if (blob.type === "image/png") return blob;
    if (typeof createImageBitmap !== "function") return blob;

    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;

    ctx.drawImage(bitmap, 0, 0);

    const pngBlob = await new Promise((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/png"),
    );

    return pngBlob || blob;
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
      const shareBlob = await toPngBlob(blob);
      const mimeType = shareBlob.type || "image/png";
      const fileName = buildFileName(quote, mimeType);
      const fileObj = new File([shareBlob], fileName, { type: mimeType });
      const shareText = quote?.quote_text || "Regarde cette superbe citation !";

      // Partage natif avec fichier (priorite)
      if (navigator.share) {
        try {
          const canShareFiles =
            typeof navigator.canShare === "function"
              ? navigator.canShare({ files: [fileObj] })
              : true;

          if (canShareFiles) {
            await navigator.share({
              title: "Quoter App",
              text: shareText,
              files: [fileObj],
            });
            return;
          }
        } catch (shareError) {
          if (isAbortError(shareError)) return;
        }
      }

      // Fallback prioritaire: copier l'image (pas le lien) dans le presse-papiers
      if (
        window.isSecureContext &&
        navigator.clipboard &&
        typeof window.ClipboardItem !== "undefined"
      ) {
        try {
          const clipboardItem = new window.ClipboardItem({ [mimeType]: shareBlob });
          await navigator.clipboard.write([clipboardItem]);
          alert("L'image a été copiée dans votre presse-papiers.");
          return;
        } catch (clipboardImageError) {
          // Continue vers les autres fallbacks
        }
      }

      // Fallback secondaire: partage URL de l'image
      if (navigator.share) {
        try {
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
        } catch (shareUrlError) {
          if (isAbortError(shareUrlError)) return;
        }
      }

      // Fallback final : copier le lien de l'image
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(imageUrl);
        alert("Le lien de l'image a été copié dans votre presse-papiers.");
        return;
      }

      alert("Partage non supporte sur ce navigateur.");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error sharing:", error);
      }

      if (isAbortError(error)) return;

      // Fallback final : copier le lien
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(imageUrl);
          alert("Le lien de l'image a été copié dans votre presse-papiers.");
        } else {
          alert("Erreur lors du partage. Veuillez réessayer.");
        }
      } catch (clipboardError) {
        alert("Erreur lors du partage. Veuillez réessayer.");
      }
    }
  };

  return share;
};
