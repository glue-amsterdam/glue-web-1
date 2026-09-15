"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { HomeTextItem } from "@/schemas/mainSchema";

const HomeTextsContext = createContext<HomeTextItem[] | null>(null);

export const HomeTextsProvider = ({
  homeTexts,
  children,
}: {
  homeTexts: HomeTextItem[];
  children: ReactNode;
}) => (
  <HomeTextsContext.Provider value={homeTexts}>
    {children}
  </HomeTextsContext.Provider>
);

export const useHomeTexts = (): HomeTextItem[] => {
  const context = useContext(HomeTextsContext);
  if (!context) {
    throw new Error("useHomeTexts must be used within HomeTextsProvider");
  }
  return context;
};
