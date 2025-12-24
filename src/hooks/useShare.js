export const useShare = () => {
  const share = async (file) => {
    if (navigator.share) {
      try {
        const response = await fetch(file);
        const blob = await response.blob();
        const fileObj = new File([blob], "quote.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
          await navigator.share({
            title: "Quoter App",
            text: "Regarde cette superbe citation !",
            files: [fileObj],
          });
        } else {
          // Fallback if files are not supported
          await navigator.share({
            title: "Quoter App",
            text: "Regarde cette superbe citation !",
            url: window.location.href,
          });
        }
      } catch (error) {
        console.error("Error sharing", error);
      }
    } else {
      alert("Le partage n'est pas supporté sur cet appareil.");
    }
  };

  return share;
};
