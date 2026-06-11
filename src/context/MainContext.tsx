"use client";

import { createContext, useContext, ReactNode } from "react";
import { MainSectionData } from "@/schemas/mainSchema";

const MainContext = createContext<MainSectionData | undefined>(undefined);

export const MainContextProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: MainSectionData;
}) => {
  return (
    <MainContext.Provider value={initialData}>{children}</MainContext.Provider>
  );
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

export { MainContext };
