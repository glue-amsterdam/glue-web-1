import { useEffect } from "react";

export function useScroll({
  id,
  idRef,
}: {
  id: string;
  idRef: React.RefObject<HTMLElement>;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === `#${id}`) {
      setTimeout(() => {
        idRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [id, idRef]);
}
