"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { SheetClose } from "@/components/ui/sheet";
import LoginForm from "../login-form/login-form";
import { useAuth } from "@/app/context/AuthContext";
import { LoggedInUserType } from "@/schemas/usersSchemas";

export default function UserMenuItems({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: LoggedInUserType) => {
    setIsLoginModalOpen(false);
    setIsOpen(false);
    router.push(`/dashboard/${user.user_id}/user-data`);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  if (user) {
    return (
      <div className="space-y-2">
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
      <button
        onClick={handleLoginModal}
        className="block w-full text-left px-2 py-1 hover:bg-accent rounded-md"
      >
        Log In
      </button>

      <SheetClose asChild>
        <Link
          href="/signup?step=1"
          className="block px-2 py-1 hover:bg-accent rounded-md"
        >
          Sign Up
        </Link>
      </SheetClose>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
