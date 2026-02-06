import { useEffect } from "react";

export const useTitle = ({ title }) => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${title}`;
    }
  }, [title]);
  return null;
};
