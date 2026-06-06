"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/app/context/AuthContext";
import { SignUpNavLink } from "@/components/sign-up/sign-up-nav-link";
import { fetchNavbarIdentity } from "@/lib/users/fetch-navbar-identity";
import type { NavbarIdentity } from "@/lib/users/get-navbar-identity";
import { getVisitorDataDashboardPath } from "@/lib/users/redirect-to-dashboard-home";
import { cn } from "@/lib/utils";

import LogoWithLink from "../LogoWithLink";
import BigButton from "../big-button";
import ExhibitorsNavbar from "./exhibitors-navbar";
import ProgramNavbar from "./program-navbar";
import MainContainer from "../main-container";

const navItems = {
  buttons: [
    {
      label: "Participate",
      href: "/participate",
    },
    {
      label: "Visit",
      href: "/visit",
    },
  ],
  links: [
    {
      label: "Exhibitors",
      href: "/exhibitors",
    },
    {
      label: "Map",
      href: "/map",
    },
    {
      label: "Program",
      href: "/program",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
};

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

const participateLinkClassName =
  "text-[15px] leading-[15px] lg:text-[19px] lg:leading-[25px] text-(--black-color)";

type NavbarClientProps = {
  initialIdentity: NavbarIdentity | null;
};

type NavbarAuthProps = {
  identity: NavbarIdentity | null;
  isAuthenticated: boolean;
  userId: string | null;
};

const Buttons = ({ identity, isAuthenticated, userId }: NavbarAuthProps) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="sm:gap-[30px] gap-[15px]">
        {navItems.buttons.map((item, i) => (
          <BigButton
            as="link"
            key={i}
            label={item.label}
            href={item.href}
            mode="navbar"
            fontSize="base"
          />
        ))}
      </Container>
    );
  }

  const dashboardHref =
    identity?.dashboardHref ??
    (userId ? getVisitorDataDashboardPath(userId) : null);

  return (
    <Container className="sm:gap-[30px] gap-[15px]">
      {dashboardHref && (
        <BigButton
          as="link"
          label="dashboard"
          href={dashboardHref}
          mode="navbar"
          fontSize="base"
        />
      )}
      <BigButton
        as="button"
        label="log out"
        mode="navbar"
        fontSize="base"
        onClick={() => void handleLogout()}
      />
    </Container>
  );
};

const Links = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  return (
    <Container className={cn("sm:gap-[30px] gap-[20px]", className)}>
      {navItems.links.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className={cn(
            "transition-colors duration-100 text-[15px] leading-[15px] lg:text-[23px] lg:leading-[29px]",
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

const ParticipateLinks = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-[30px]">
      <Suspense
        fallback={
          <Link href="/sign-up" className={participateLinkClassName}>
            Sign Up
          </Link>
        }
      >
        <SignUpNavLink className={participateLinkClassName}>Sign Up</SignUpNavLink>
      </Suspense>
      <Link href="/login" className={participateLinkClassName}>
        Login
      </Link>
    </div>
  );
};

export const NavBarClient = ({ initialIdentity }: NavbarClientProps) => {
  const pathname = usePathname();
  const { user, isLoading, navbarIdentity } = useAuth();
  const [liveIdentity, setLiveIdentity] = useState<NavbarIdentity | null>(null);

  useEffect(() => {
    if (!user) {
      setLiveIdentity(null);
      return;
    }

    if (initialIdentity || navbarIdentity) {
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
  }, [user, initialIdentity, navbarIdentity]);

  const isAuthenticated =
    user !== null || (isLoading && initialIdentity !== null);
  const identity = isAuthenticated
    ? (initialIdentity ?? navbarIdentity ?? liveIdentity)
    : null;
  const userId = user?.id ?? null;

  const showExhibitorsNav = pathname === "/exhibitors";
  const showProgramNav = pathname === "/program";
  const showParticipateNav = pathname === "/participate" && !isAuthenticated;
  const showVisitNav = pathname === "/visit" && !isAuthenticated;

  return (
    <div className="fixed font-normal top-0 w-full z-50">
      <nav className="bg-(--white-color)">
        <MainContainer>
          <Block className="h-(--nav-primary-h-mobile) lg:h-(--nav-primary-h)">
            <div className="lg:w-[250px]">
              <LogoWithLink className="size-10 lg:size-[60px] lg:hover:scale-105 lg:transition-all lg:duration-100" />
            </div>
            <Links className="hidden lg:flex" />
            <Buttons
              identity={identity}
              isAuthenticated={isAuthenticated}
              userId={userId}
            />
          </Block>
          <Block className="flex lg:hidden h-(--nav-secondary-h-mobile)">
            <Links />
          </Block>
        </MainContainer>
      </nav>
      {showParticipateNav && (
        <MainContainer>
          <Block className="flex justify-end h-(--nav-secondary-h-mobile) lg:h-(--nav-secondary-h)">
            <ParticipateLinks isAuthenticated={isAuthenticated} />
          </Block>
        </MainContainer>
      )}
      {showVisitNav && (
        <MainContainer>
          <Block className="flex justify-end h-(--nav-secondary-h-mobile) lg:h-(--nav-secondary-h)">
            <ParticipateLinks isAuthenticated={isAuthenticated} />
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
