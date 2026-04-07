"use client";

import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useVisitor } from "@/app/context/VisitorContext";
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
  const [memberLoginFirst, setMemberLoginFirst] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { visitor, visitorLogout } = useVisitor();

  const handleExitVisitor = async () => {
    await visitorLogout();
    setIsOpen(false);
    router.refresh();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLoginModal = (
    e: React.MouseEvent,
    opts?: { memberLoginFirst?: boolean },
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setMemberLoginFirst(opts?.memberLoginFirst ?? false);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    setMemberLoginFirst(false);
    setIsOpen(false);
    if (pathname === "/") {
      router.push(`/dashboard/${loggedInUser.id}/user-data`);
    } else {
      router.refresh();
    }
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setMemberLoginFirst(false);
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

  if (visitor) {
    return (
      <div className="space-y-2 flex w-full max-w-[280px] flex-col items-end text-black">
        <p className="px-2 text-right text-xs text-muted-foreground">
          Visitor · {visitor.full_name}
        </p>
        <Link
          href="/events"
          className="px-2 py-1 hover:bg-accent md:text-xs"
          onClick={() => setIsOpen(false)}
        >
          Events
        </Link>
        <button
          type="button"
          onClick={() => void handleExitVisitor()}
          className="px-2 py-1 hover:bg-accent md:text-xs"
        >
          Exit visitor session
        </button>
        <button
          type="button"
          onClick={(e) => handleLoginModal(e, { memberLoginFirst: true })}
          className="flex items-center gap-2 px-2 py-1 hover:bg-accent md:text-xs"
        >
          <LogIn size={20} />
          Log in with full account
        </button>
        <LoginForm
          isOpen={isLoginModalOpen}
          memberLoginFirst={memberLoginFirst}
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />
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
        memberLoginFirst={memberLoginFirst}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
