import { useEffect, useCallback } from "react";

export function useScroll(delay: number = 500) {
  const scrollToElement = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, delay);
      }
    },
    [delay]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.slice(1);
      scrollToElement(id);
    }
  }, [scrollToElement]);

  return scrollToElement;
}
