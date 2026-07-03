"use client";

import { AuthProvider } from "@/context/AuthContext";
import { AuthCancelPathTracker } from "@/components/auth/auth-cancel-path-tracker";
import { ProtectedRouteLinkInterceptor } from "@/components/auth/protected-route-link-interceptor";

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <AuthCancelPathTracker />
      <ProtectedRouteLinkInterceptor />
      {children}
    </AuthProvider>
  );
};
