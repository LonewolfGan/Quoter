import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToTop = () => {
  const { pathname, search, state } = useLocation();
  const prevLocation = useRef(`${pathname}${search}`);

  useEffect(() => {
    // Ne pas faire défiler si le défilement est désactivé via l'état
    if (state?.preventScroll) {
      window.scrollTo(0, 0);
      return;
    }

    if (prevLocation.current !== `${pathname}${search}`) {
      const target = document.querySelector("main");
      const currentLocation = `${pathname}${search}`;

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      prevLocation.current = currentLocation;
    }
  }, [pathname, search, state]);
};
