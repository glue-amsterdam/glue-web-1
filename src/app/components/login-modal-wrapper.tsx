"use client";

import { useState, useEffect } from "react";
import LoginForm from "@/app/components/login-form/login-form";

export default function LoginModalWrapper({
  initialLoginRequired,
}: {
  initialLoginRequired: boolean;
}) {
  const [isLoginRequired, setIsLoginRequired] = useState(initialLoginRequired);

  useEffect(() => {
    setIsLoginRequired(initialLoginRequired);
  }, [initialLoginRequired]);

  const handleClose = () => {
    setIsLoginRequired(false);
    document.cookie = "login_required=; Max-Age=0; path=/; sameSite=strict";
  };

  if (!isLoginRequired) {
    return null;
  }

  return (
    <LoginForm
      isOpen={isLoginRequired}
      onClose={handleClose}
      onLoginSuccess={() => handleClose()}
    />
  );
}
