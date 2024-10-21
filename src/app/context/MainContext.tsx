"use client";

import { MainSection } from "@/utils/menu-types";
import { createContext, useContext } from "react";

const MainContext = createContext<MainSection | undefined>(undefined);

export const useColors = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useColors must be used within a ColorsProvider");
  }
  return context.mainColors;
};
export const useMenu = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useColors must be used within a ColorsProvider");
  }
  return context.mainMenu;
};
export const useLinks = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useColors must be used within a ColorsProvider");
  }
  return context.mainLinks;
};

export const MainContextProvider = ({
  children,
  mainColors,
  mainMenu,
  mainLinks,
}: {
  children: React.ReactNode;
  mainColors: MainSection["mainColors"];
  mainMenu: MainSection["mainMenu"];
  mainLinks: MainSection["mainLinks"];
}) => {
  return (
    <MainContext.Provider value={{ mainColors, mainMenu, mainLinks }}>
      {children}
    </MainContext.Provider>
  );
};
