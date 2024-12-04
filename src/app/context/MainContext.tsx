"use client";

import { createContext, useContext, ReactNode } from "react";
import useSWR from "swr";
import { MainSectionData } from "@/schemas/mainSchema";
import { ColorStyleProvider } from "@/app/components/color-style-provider";

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
    refreshInterval: 60000, // Revalidate every minute
  });

  return (
    <MainContext.Provider value={data}>
      <ColorStyleProvider colors={data?.mainColors || initialData.mainColors}>
        {children}
      </ColorStyleProvider>
    </MainContext.Provider>
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
    throw new Error("useEventsDays must be used within a MainContextProvider");
  }
  return context.eventDays;
};
