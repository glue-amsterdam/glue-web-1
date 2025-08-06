"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { MainSectionData } from "@/schemas/mainSchema";

const MainContext = createContext<MainSectionData | undefined>(undefined);

/* Create color styles for the root element */
function createColorStyles(colors: Record<string, string>) {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    acc[`--color-${key}`] = value;
    return acc;
  }, {} as Record<string, string>);
}
export const MainContextProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: MainSectionData;
}) => {
  /* Set color styles for the root element */
  useEffect(() => {
    const root = document.documentElement;
    const styles = createColorStyles(initialData.mainColors);
    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [initialData]);

  return (
    <MainContext.Provider value={initialData}>{children}</MainContext.Provider>
  );
};

export const useColors = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useColors must be used within a MainContextProvider");
  }
  return context.mainColors;
};

export const useMenu = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMenu must be used within a MainContextProvider");
  }
  return context.mainMenu;
};

export const useLinks = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useLinks must be used within a MainContextProvider");
  }
  return context.mainLinks;
};

export const useEventsDays = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useEventDays must be used within a MainContextProvider");
  }

  const sortedEventDays = [...context.eventDays].sort((a, b) => {
    const numA = parseInt(a.dayId.split("-")[1], 10);
    const numB = parseInt(b.dayId.split("-")[1], 10);
    return numA - numB;
  });

  return sortedEventDays;
};

export const useHomeText = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useHomeText must be used within a MainContextProvider");
  }
  return context.homeText;
};

export { MainContext };
