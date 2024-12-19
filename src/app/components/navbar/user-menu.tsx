"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiUser } from "react-icons/ci";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LoginForm from "../login-form/login-form";
import { useAuth } from "@/app/context/AuthContext";
import { User } from "@supabase/supabase-js";

export default function UserMenu(): JSX.Element {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
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

  const handleLoginSuccess = (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    if (pathname === "/") {
      router.push(`/dashboard/${loggedInUser.id}/user-data`);
    } else {
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <CiUser className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user && (
          <>
            <DropdownMenuLabel>{`Hello, ${user.email}`}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          {user ? (
            <>
              <DropdownMenuItem>
                <Link href={`/dashboard/${user.id}/user-data`}>Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                Log Out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={handleLoginModal}>
                Log In
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/signup?step=1">Sign Up</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </DropdownMenu>
  );
}
