"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import LogoWithLink from "./LogoWithLink";
import BigButton from "./big-button";
import ExhibitorsNavbar from "./navbar/exhibitors-navbar";
import ProgramNavbar from "./navbar/program-navbar";
import MainContainer from "./main-container";

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

const Buttons = () => {
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

const ParticipateLinks = () => {
  return (
    <div className="flex items-center gap-[30px]">
      <Link href="/sign-up" className="text-[15px] leading-[15px] lg:text-[19px] lg:leading-[25px] text-(--black-color)">Sign Up</Link>
      <Link href="/login" className="text-[15px] leading-[15px] lg:text-[19px] lg:leading-[25px] text-(--black-color)">Login</Link>
    </div>)
}

const NavBar = () => {
  const pathname = usePathname();
  const showExhibitorsNav = pathname === "/exhibitors";
  const showProgramNav = pathname === "/program";
  const showParticipateNav = pathname === "/participate";



  return (
    <div className="fixed font-normal top-0 w-full z-50">
      <nav className="bg-(--white-color)">
        <MainContainer>
          <Block className="h-(--nav-primary-h-mobile) lg:h-(--nav-primary-h)">
            <div className="lg:w-[250px]">
              <LogoWithLink className="size-10 lg:size-[60px] lg:hover:scale-105 lg:transition-all lg:duration-100" />
            </div>
            <Links className="hidden lg:flex" />
            <Buttons />
          </Block>
          <Block className="flex lg:hidden h-(--nav-secondary-h-mobile)">
            <Links />
          </Block>
        </MainContainer>
      </nav>
      {showParticipateNav && (
        <MainContainer>
          <Block className="flex justify-end h-(--nav-secondary-h-mobile) lg:h-(--nav-secondary-h)">
            <ParticipateLinks />
          </Block></MainContainer>
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

export default NavBar;
