"use client";

import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User } from "@supabase/supabase-js";
import LoginForm from "@/app/components/login-form/login-form";
import { Link } from "next-view-transitions";
import { LogIn, PencilLine } from "lucide-react";

export default function UserMenuItems({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
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

  const handleLoginSuccess = (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    setIsOpen(false);
    if (pathname === "/") {
      router.push(`/dashboard/${loggedInUser.id}/user-data`);
    } else {
      router.refresh();
    }
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  if (user) {
    return (
      <div className="space-y-2 flex flex-col justify-center items-end text-black">
        <button
          onClick={handleLogout}
          className="px-2 py-1 hover:bg-accent flex items-center gap-2 md:text-xs text-black"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col justify-center items-end text-black">
      <button
        onClick={handleLoginModal}
        className="px-2 py-1 hover:bg-accent flex items-center gap-2 md:text-xs text-black"
      >
        <LogIn size={20} />
        Log In
      </button>

      <Link
        href="/signup?step=1"
        className="px-2 py-1 hover:bg-accent flex items-center gap-2 md:text-xs text-black"
        onClick={() => setIsOpen(false)}
      >
        <PencilLine size={20} />
        Sign Up
      </Link>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
