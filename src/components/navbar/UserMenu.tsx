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
import { useVisitor } from "@/app/context/VisitorContext";

import { cn } from "@/lib/utils";
import type { LoginModalOpenOptions } from "@/app/components/login-form/login-form";

export default function UserMenu({
  className,
  handleLoginModal,
}: {
  className?: string;
  handleLoginModal: (
    e: React.MouseEvent,
    options?: LoginModalOpenOptions,
  ) => void;
}): JSX.Element {
  const router = useRouter();

  const { user, logout } = useAuth();
  const { visitor, visitorLogout } = useVisitor();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleExitVisitor = async () => {
    await visitorLogout();
    router.refresh();
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
          <CiUser className="size-8 outline-none focus:ring-0 focus:ring-offset-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuLabel>{`Hello, ${user.email}`}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {!user && visitor ? (
          <>
            <DropdownMenuLabel className="max-w-[240px]">
              <span className="text-xs font-normal text-muted-foreground">
                Visitor
              </span>
              <span className="block truncate font-medium">
                {visitor.full_name}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {visitor.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}

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
          ) : visitor ? (
            <div className="flex flex-col gap-1">
              <DropdownMenuItem>
                <Link href="/events">Events</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  void handleExitVisitor();
                }}
              >
                Exit visitor session
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) =>
                  handleLoginModal(e, { memberLoginFirst: true })
                }
              >
                Log in with full account
              </DropdownMenuItem>
            </div>
          ) : (
            <>
              <DropdownMenuItem
                onClick={(e) => handleLoginModal(e, { memberLoginFirst: false })}
              >
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
