"use client";

import { MainColors } from "@/utils/menu-types";
import React, { createContext, useContext } from "react";

interface ColorsContextType {
  colors: MainColors;
}

const ColorsContext = createContext<ColorsContextType | undefined>(undefined);

export const useColors = () => {
  const context = useContext(ColorsContext);
  if (!context) {
    throw new Error("useColors must be used within a ColorsProvider");
  }
  return context;
};

export const ColorsProvider = ({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: MainColors;
}) => {
  return (
    <ColorsContext.Provider value={{ colors }}>
      {children}
    </ColorsContext.Provider>
  );
};
