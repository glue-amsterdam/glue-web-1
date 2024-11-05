"use client";

import { useAuth } from "@/app/context/AuthContext";
import LoginForm from "./login-form";

export function ClientLoginForm() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  return (
    <LoginForm
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      onLogin={login}
    />
  );
}
