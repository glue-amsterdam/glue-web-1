"use client";

import { AuthProvider } from "@/app/context/AuthContext";

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};
