"use client";

import React, { createContext, useContext } from "react";
import { useColors } from "./MainContext";

type DashboardContextType = {
  isMod?: boolean;
  targetUserId?: string;
  loggedInUserId?: string;
  loggedPlanType?: string;
  loggedPlanId?: string;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
};

export const DashboardProvider: React.FC<
  DashboardContextType & { children: React.ReactNode }
> = ({ children, isMod, targetUserId, loggedInUserId, loggedPlanType }) => {
  const { box3 } = useColors();
  return (
    <DashboardContext.Provider
      value={{
        isMod,
        targetUserId,
        loggedInUserId,
        loggedPlanType,
      }}
    >
      <div
        className="w-full flex-1 min-h-0 overflow-y-auto py-4"
        style={{ backgroundColor: box3 }}
      >
        {children}
      </div>
    </DashboardContext.Provider>
  );
};
