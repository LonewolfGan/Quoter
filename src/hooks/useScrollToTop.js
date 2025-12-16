import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToTop = () => {
  const { pathname, search } = useLocation();
  const prevLocation = useRef(`${pathname}${search}`);

  useEffect(() => {
    const target = document.querySelector("main");
    const currentLocation = `${pathname}${search}`;

    if (prevLocation.current !== currentLocation) {
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    prevLocation.current = currentLocation;
  }, [pathname, search]);
};
