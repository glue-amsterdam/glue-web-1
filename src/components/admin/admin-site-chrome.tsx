"use client";

import { usePathname } from "next/navigation";
import { NavBarClient } from "@/components/navbar/navbar-client";
import Footer from "@/components/home/bottom-navigation/bottom-navigation";
import type { NavbarLink } from "@/lib/nav/build-navbar-links";
import type { HomeTextItem } from "@/schemas/mainSchema";

type AdminSiteChromeProps = {
  children: React.ReactNode;
  navLinks: NavbarLink[];
  homeTexts: HomeTextItem[];
};

export const isAdminRoute = (pathname: string) => pathname.startsWith("/admin");

export const AdminSiteChrome = ({
  children,
  navLinks,
  homeTexts,
}: AdminSiteChromeProps) => {
  const pathname = usePathname();
  const hideSiteChrome = isAdminRoute(pathname);

  return (
    <>
      {!hideSiteChrome && <NavBarClient navLinks={navLinks} />}
      {children}
      {!hideSiteChrome && <Footer homeTexts={homeTexts} />}
    </>
  );
};
