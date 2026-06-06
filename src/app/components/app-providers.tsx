"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { NavBarClient } from "@/components/navbar/navbar-client";
import type { NavbarIdentity } from "@/lib/users/get-navbar-identity";

type AppProvidersProps = {
  children: React.ReactNode;
  navbarInitialIdentity: NavbarIdentity | null;
};

export const AppProviders = ({
  children,
  navbarInitialIdentity,
}: AppProvidersProps) => {
  return (
    <AuthProvider>
      <NavBarClient initialIdentity={navbarInitialIdentity} />
      {children}
    </AuthProvider>
  );
};
