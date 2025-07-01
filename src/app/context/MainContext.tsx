"use client";

import { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { MainSectionData } from "@/schemas/mainSchema";

const MainContext = createContext<MainSectionData | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const MainContextProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: MainSectionData;
}) => {
  const { data } = useSWR<MainSectionData>("/api/main", fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 86400000,
  });

  return <MainContext.Provider value={data}>{children}</MainContext.Provider>;
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
