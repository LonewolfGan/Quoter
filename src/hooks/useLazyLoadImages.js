import { useEffect } from "react";

export const useLazyLoadImages = () => {
  useEffect(() => {
    // Native lazy loading support check
    if ("IntersectionObserver" in window) {
      const images = document.querySelectorAll("img[loading='lazy']");
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.srcSet = img.dataset.srcset || img.srcSet;
            observer.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));

      return () => {
        images.forEach((img) => imageObserver.unobserve(img));
      };
    }
  }, []);
};
