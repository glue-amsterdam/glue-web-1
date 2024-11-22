"use client";

import { createContext, useContext } from "react";
import { MainSection } from "@/utils/menu-types";

const MainContext = createContext<MainSection | undefined>(undefined);

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
  return context.eventsDays;
};

export const MainContextProvider = ({
  children,
  mainColors,
  mainMenu,
  mainLinks,
  eventsDays,
}: {
  children: React.ReactNode;
  mainColors: MainSection["mainColors"];
  mainMenu: MainSection["mainMenu"];
  mainLinks: MainSection["mainLinks"];
  eventsDays: MainSection["eventsDays"];
}) => {
  return (
    <MainContext.Provider
      value={{ mainColors, mainMenu, mainLinks, eventsDays }}
    >
      {children}
    </MainContext.Provider>
  );
};
