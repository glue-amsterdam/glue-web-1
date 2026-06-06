"use client";

import { Suspense, useState, type Dispatch, type SetStateAction } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { User } from "@supabase/supabase-js";
import LoginForm from "@/app/components/login-form/login-form";
import { SignUpNavLink } from "@/components/sign-up/sign-up-nav-link";
import { Link } from "next-view-transitions";
import { fetchDashboardHomeHref } from "@/lib/users/fetch-dashboard-home";
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

  const handleLoginSuccess = async (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    setMemberLoginFirst(false);
    setIsOpen(false);
    if (pathname === "/") {
      const href =
        (await fetchDashboardHomeHref()) ??
        `/dashboard/${loggedInUser.id}/visitor-data`;
      router.push(href);
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

  return (
    <div className="space-y-2 flex flex-col justify-center items-end text-black">
      <button
        onClick={handleLoginModal}
        className="px-2 py-1 hover:bg-accent flex items-center gap-2 md:text-xs text-black"
      >
        <LogIn size={20} />
        Log In
      </button>

      <Suspense
        fallback={
          <Link
            href="/sign-up"
            className="px-2 py-1 hover:bg-accent flex items-center gap-2 md:text-xs text-black"
            onClick={() => setIsOpen(false)}
          >
            <PencilLine size={20} />
            Sign Up
          </Link>
        }
      >
        <SignUpNavLink
          className="px-2 py-1 hover:bg-accent flex items-center gap-2 md:text-xs text-black"
          onClick={() => setIsOpen(false)}
        >
          <PencilLine size={20} />
          Sign Up
        </SignUpNavLink>
      </Suspense>
      <LoginForm
        isOpen={isLoginModalOpen}
        memberLoginFirst={memberLoginFirst}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
