"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/app/context/AuthContext";
import LoginForm from "@/app/components/login-form/login-form";

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isLocked = useMemo(() => !isLoading && !user, [isLoading, user]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const reopenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLocked) {
      setIsLoginModalOpen(false);
      return;
    }

    setIsLoginModalOpen(true);
  }, [isLocked]);

  useEffect(() => {
    return () => {
      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
        reopenTimeoutRef.current = null;
      }
    };
  }, []);

  const handleLoginSuccess = (_loggedInUser: User) => {
    setIsLoginModalOpen(false);
    router.refresh();
  };

  const handleCloseLoginModal = () => {
    if (isLocked) {
      setIsLoginModalOpen(false);

      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
      }

      reopenTimeoutRef.current = setTimeout(() => {
        setIsLoginModalOpen(true);
      }, 150);
      return;
    }

    setIsLoginModalOpen(false);
  };

  return (
    <div className="relative">
      <div
        className={isLocked ? "pointer-events-none select-none blur-sm" : ""}
        aria-hidden={isLocked}
      >
        {children}
      </div>

      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

