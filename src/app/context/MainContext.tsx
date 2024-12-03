"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
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
  children: ReactNode;
  mainColors: MainSectionData["mainColors"];
  mainMenu: MainSectionData["mainMenu"];
  mainLinks: MainSectionData["mainLinks"];
  eventDays: MainSectionData["eventDays"];
}) => {
  const [colors, setColors] = useState(mainColors);
  const [links, setLinks] = useState(mainLinks);
  const [menu, setMenu] = useState(mainMenu);
  const [days, setDays] = useState(eventDays);

  useEffect(() => {
    setColors(mainColors);
    setLinks(mainLinks);
    setMenu(mainMenu);
    setDays(eventDays);
  }, [mainColors, mainLinks, mainMenu, eventDays]);
  return (
    <MainContext.Provider
      value={{
        mainColors: colors,
        mainMenu: menu,
        mainLinks: links,
        eventDays: days,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
