"use client";

import { createContext, useContext } from "react";

type UserDashboardContextType = {
  userId: string;
};

const UserDashboardContext = createContext<
  UserDashboardContextType | undefined
>(undefined);

export const UserDashboardProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  return (
    <UserDashboardContext.Provider value={{ userId }}>
      {children}
    </UserDashboardContext.Provider>
  );
};

export const useDashboardUserContext = () => {
  const context = useContext(UserDashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardUserContext must be used within a UserProvider"
    );
  }
  return context;
};
