import { getDownloadFileName } from "../utils/imageHelper";

export const useDownload = () => {
  const download = async (imageUrl, quote = null) => {
    try {
      if (!imageUrl || typeof imageUrl !== "string") {
        if (process.env.NODE_ENV === "development") {
          console.error("Invalid image URL:", imageUrl);
        }
        return;
      }

      const response = await fetch(imageUrl);

      if (!response.ok) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch image:", response.statusText);
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = quote ? getDownloadFileName(quote) : "quote.png";

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error downloading image:", error);
      }
    }
  };

  return download;
};
