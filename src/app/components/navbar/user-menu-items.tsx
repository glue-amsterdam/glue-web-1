"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SheetClose } from "@/components/ui/sheet";
import LoginForm from "../login-form/login-form";
import { useAuth } from "@/app/context/AuthContext";

export default function UserMenuItems(): JSX.Element {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout, login } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginModal = () => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (user) {
    return (
      <div className="space-y-2">
        <SheetClose asChild>
          <Link
            href="/dashboard"
            className="block px-2 py-1 hover:bg-accent rounded-md"
          >
            Dashboard
          </Link>
        </SheetClose>

        <SheetClose asChild>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-2 py-1 hover:bg-accent rounded-md"
          >
            Log Out
          </button>
        </SheetClose>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleLoginModal}
        className="block px-2 py-1 hover:bg-accent rounded-md"
      >
        Log In
      </div>

      <SheetClose asChild>
        <Link
          href="/signup"
          className="block px-2 py-1 hover:bg-accent rounded-md"
        >
          Sign Up
        </Link>
      </SheetClose>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
