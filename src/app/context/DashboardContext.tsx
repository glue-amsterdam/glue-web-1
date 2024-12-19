"use client";

import React, { createContext, useContext } from "react";

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
  return (
    <DashboardContext.Provider
      value={{
        isMod,
        targetUserId,
        loggedInUserId,
        loggedPlanType,
      }}
    >
      <div className="md:pl-80 container mx-auto px-4">{children}</div>
    </DashboardContext.Provider>
  );
};
