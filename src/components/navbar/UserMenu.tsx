"use client";

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
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

import { cn } from "@/lib/utils";

export default function UserMenu({
  className,
  handleLoginModal,
}: {
  className?: string;
  handleLoginModal: (e: React.MouseEvent) => void;
}): JSX.Element {
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            className,
            "hover:scale-95 transition-all duration-100"
          )}
        >
          <CiUser className="size-7 outline-none focus:ring-0 focus:ring-offset-0" />
        </button>
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
            <div className="flex flex-col gap-1">
              <DropdownMenuItem>
                <Link href={`/dashboard/${user.id}/user-data`}>
                  My GLUE account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                Log Out
              </DropdownMenuItem>
            </div>
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
    </DropdownMenu>
  );
}
