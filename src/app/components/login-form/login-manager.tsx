"use client";

import { Button } from "@/components/ui/button";
import { ClientLoginForm } from "./client-login-form";
import { useAuth } from "./auth-context";

export function LoginManager() {
  const { user, logout, openLoginModal } = useAuth();

  if (user) {
    return (
      <Button variant="outline" onClick={logout}>
        Sign Out ({user.email})
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={openLoginModal}>
        Log In
      </Button>
      <ClientLoginForm />
    </>
  );
}
