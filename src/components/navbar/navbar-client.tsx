"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AccountNavLink } from "@/components/account/account-nav-link";
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

const AccountNav = () => {
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

export const NavBarClient = ({ navLinks }: NavbarClientProps) => {
  const pathname = usePathname();

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
            <AccountNav />
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
