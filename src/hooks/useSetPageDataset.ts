"use client";

/* TODO-REVEW: PASS THIS TEXT INTO ENGLISH */

import { useNavigation } from "@/app/context/NavigationContext";
import { useEffect } from "react";

export function useSetPageDataset(currentPage: string) {
  const { previousUrl } = useNavigation();

  useEffect(() => {
    const root = document.documentElement;

    const delay = 1000;

    const timeout = setTimeout(() => {
      // ⚠️ Seteamos .from con un pequeño delay para que no rompa la animación
      root.dataset.from = currentPage;

      // ✅ Solo en home usamos el previousUrl como .to
      if (currentPage === "home" && previousUrl) {
        const toPage = previousUrl.replace(/^\//, "") || "home";
        root.dataset.to = toPage;
      }

      // ✅ En cualquier página que no sea home, asumimos que volveremos a home

      if (currentPage !== "home") {
        root.dataset.to = "home";
      }

      // Fallback de seguridad si no se setea .to
      if (!root.dataset.to) {
        root.dataset.to = currentPage;
      }
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentPage, previousUrl]);
}
