"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { AccountNavLink } from "@/components/account/account-nav-link";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { fetchNavbarIdentity } from "@/lib/users/fetch-navbar-identity";
import type { NavbarIdentity } from "@/lib/users/get-navbar-identity";
import { cn } from "@/lib/utils";

import LogoWithLink from "../LogoWithLink";
import BigButton from "../big-button";
import ExhibitorsNavbar from "./exhibitors-navbar";
import ProgramNavbar from "./program-navbar";
import MainContainer from "../main-container";
import type { NavbarLink } from "@/lib/nav/build-navbar-links";

const navButtons = [
  { label: "Participate", href: "/participate" },
  { label: "Visit", href: "/visit" },
];

const Block = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "border-b lg:border-b-2 border-(--black-color) py-[12px] flex items-center justify-between bg-(--background-color)",
      className
    )}
  >
    {children}
  </div>
);

const Container = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex items-center", className)}>{children}</div>;
};

const accountLinkClassName =
  "text-[15px] leading-[15px] lg:text-[19px] lg:leading-[25px] transition-colors duration-100 navigation";

type NavbarClientProps = {
  navLinks: NavbarLink[];
};

const Buttons = () => {
  const pathname = usePathname();

  const isNavButtonActive = (href: string) => {
    if (href === "/participate") {
      return pathname === "/participate";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Container className="sm:gap-[30px] gap-[15px]">
      {navButtons.map((item, i) => (
        <BigButton
          as="link"
          key={i}
          label={item.label}
          href={item.href}
          mode="navbar"
          fontSize="base"
          isActive={isNavButtonActive(item.href)}
        />
      ))}
    </Container>
  );
};

const Links = ({
  className,
  navLinks,
}: {
  className?: string;
  navLinks: NavbarLink[];
}) => {
  const pathname = usePathname();

  return (
    <Container className={cn("sm:gap-[30px] gap-[20px]", className)}>
      {navLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors duration-100 navigation",
            pathname === item.href
              ? "text-(--primary-color)"
              : "text-(--black-color)"
          )}
        >
          {item.label}
        </Link>
      ))}
    </Container>
  );
};

const LoggedOutAccountNav = () => {
  const pathname = usePathname();
  const isAccountActive = pathname === "/account";

  return (
    <Suspense
      fallback={
        <Link
          href="/account"
          className={cn(
            accountLinkClassName,
            isAccountActive
              ? "text-(--primary-color)"
              : "text-(--black-color)",
          )}
        >
          Account
        </Link>
      }
    >
      <AccountNavLink
        className={cn(
          accountLinkClassName,
          isAccountActive
            ? "text-(--primary-color)"
            : "text-(--black-color)",
        )}
      >
        Account
      </AccountNavLink>
    </Suspense>
  );
};

type LoggedInAccountNavProps = {
  dashboardHref: string | null;
};

const LoggedInAccountNav = ({ dashboardHref }: LoggedInAccountNavProps) => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isDashboardActive = pathname.startsWith("/dashboard/");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteError(
          typeof result.message === "string"
            ? result.message
            : "Could not delete your account. Please try again.",
        );
        return;
      }

      setIsDeleteDialogOpen(false);
      await logout();
    } catch {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const navActionClassName = (isActive: boolean) =>
    cn(
      accountLinkClassName,
      isActive ? "text-(--primary-color)" : "text-(--black-color) cursor-pointer",
    );

  return (
    <>
      <Container className="sm:gap-[30px] gap-[20px]">
        {dashboardHref ? (
          <Link
            href={dashboardHref}
            className={navActionClassName(isDashboardActive)}
            aria-label="Go to dashboard"
          >
            Account
          </Link>
        ) : null}
        <button
          type="button"
          className={navActionClassName(false)}
          onClick={() => void handleLogout()}
          aria-label="Log out of your account"
        >
          Log Out
        </button>
        <button
          type="button"
          className={navActionClassName(false)}
          onClick={handleOpenDeleteDialog}
          aria-label="Delete your account"
        >
          Delete Account
        </button>
      </Container>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data,
              including your visitor profile and participant details. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p role="alert" className="body-text px-6">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

type AccountNavProps = {
  isAuthenticated: boolean;
  dashboardHref: string | null;
};

const AccountNav = ({ isAuthenticated, dashboardHref }: AccountNavProps) => {
  if (isAuthenticated) {
    return <LoggedInAccountNav dashboardHref={dashboardHref} />;
  }

  return <LoggedOutAccountNav />;
};

export const NavBarClient = ({ navLinks }: NavbarClientProps) => {
  const pathname = usePathname();
  const { user, navbarIdentity } = useAuth();
  const [liveIdentity, setLiveIdentity] = useState<NavbarIdentity | null>(null);

  useEffect(() => {
    if (!user) {
      setLiveIdentity(null);
      return;
    }

    if (navbarIdentity) {
      setLiveIdentity(null);
      return;
    }

    let cancelled = false;

    const loadIdentity = async () => {
      const identity = await fetchNavbarIdentity();
      if (!cancelled) {
        setLiveIdentity(identity);
      }
    };

    void loadIdentity();

    return () => {
      cancelled = true;
    };
  }, [user, navbarIdentity]);

  const isAuthenticated = user !== null;
  const identity = isAuthenticated ? (navbarIdentity ?? liveIdentity) : null;
  const dashboardHref = identity?.dashboardHref ?? null;

  const showExhibitorsNav = pathname === "/exhibitors";
  const showProgramNav = pathname === "/program";
  const showAccountNav =
    pathname === "/participate" || pathname === "/visit";

  return (
    <div className="fixed font-normal top-0 w-full z-50 animate-enter-down">
      <nav className="bg-(--background-color)">
        <MainContainer>
          <Block className="h-(--nav-primary-h-mobile) lg:h-(--nav-primary-h)">
            <div className="lg:w-[250px]">
              <LogoWithLink className="size-10 lg:size-[60px]" />
            </div>
            <Links className="hidden lg:flex" navLinks={navLinks} />
            <Buttons />
          </Block>
          <Block className="flex lg:hidden h-(--nav-secondary-h-mobile)">
            <Links navLinks={navLinks} />
          </Block>
        </MainContainer>
      </nav>
      {showAccountNav && (
        <MainContainer>
          <Block className="flex justify-end h-(--nav-secondary-h-mobile) lg:h-(--nav-secondary-h)">
            <AccountNav
              isAuthenticated={isAuthenticated}
              dashboardHref={dashboardHref}
            />
          </Block>
        </MainContainer>
      )}
      {showExhibitorsNav && (
        <div>
          <MainContainer>
            <Suspense fallback={null}>
              <ExhibitorsNavbar />
            </Suspense>
          </MainContainer>
        </div>
      )}
      {showProgramNav && (
        <div>
          <MainContainer>
            <Suspense fallback={null}>
              <ProgramNavbar />
            </Suspense>
          </MainContainer>
        </div>
      )}
    </div>
  );
};
