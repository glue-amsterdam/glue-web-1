"use client";

import { createContext, useContext } from "react";
import { MainSectionData } from "@/schemas/mainSchema";

const MainContext = createContext<MainSectionData | undefined>(undefined);

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

export const MainContextProvider = ({
  children,
  mainColors,
  mainMenu,
  mainLinks,
  eventDays,
}: {
  children: React.ReactNode;
  mainColors: MainSectionData["mainColors"];
  mainMenu: MainSectionData["mainMenu"];
  mainLinks: MainSectionData["mainLinks"];
  eventDays: MainSectionData["eventDays"];
}) => {
  return (
    <MainContext.Provider
      value={{ mainColors, mainMenu, mainLinks, eventDays }}
    >
      {children}
    </MainContext.Provider>
  );
};
