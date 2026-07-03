import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";
import { lausanne } from "@/app/fonts";
import { LayoutMetadata } from "@/lib/metadata";

import { fetchMain } from "@/lib/main/fetch-main";
import { getTheme } from "@/lib/theme";
import { buildNavbarLinks } from "@/lib/nav/build-navbar-links";
import { buildCategoryCssVars } from "@/lib/participants/participant-categories";

import { AppProviders } from "@/components/app-providers";
import { MainContextProvider } from "../context/MainContext";
import { ParticipantCategoriesProvider } from "@/context/ParticipantCategoriesContext";
import { getNavbarInitialIdentity } from "@/lib/users/get-navbar-initial-identity";
import { AdminSiteChrome } from "@/components/admin/admin-site-chrome";

import { Toaster } from "@/components/ui/toaster";

import {
  CookieBanner,
  CookieBannerProvider,
} from "@/components/cookies/cookies-banner";
import InternalNavigationTracker from "@/components/internal-navigation-tracker";
import HashScroll from "@/components/hash-scroll";

export const metadata = LayoutMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialData, theme, navbarInitialIdentity] = await Promise.all([
    fetchMain(),
    getTheme(),
    getNavbarInitialIdentity(),
  ]);
  const navLinks = buildNavbarLinks(theme.navMenu);
  const categoryCssVars = buildCategoryCssVars(theme.participantCategories);

  return (
    <html
      lang="en"
      className={lausanne.variable}
      style={
        {
          "--primary-color": theme.primaryColor,
          "--background-color": theme.backgroundColor,
          "--black-color": theme.blackColor,
          "--gray-color": "#DADADA",
          "--white-color": theme.whiteColor,
          ...categoryCssVars,
        } as React.CSSProperties
      }
    >
      <body className={`${lausanne.className} bg-(--background-color)`}>
        <MainContextProvider initialData={initialData}>
          <ParticipantCategoriesProvider
            categories={theme.participantCategories}
          >
            <AppProviders>
              <CookieBannerProvider>
                <AdminSiteChrome
                  navbarInitialIdentity={navbarInitialIdentity}
                  navLinks={navLinks}
                  homeTexts={theme.homeTexts}
                >
                  <InternalNavigationTracker />
                  <HashScroll />
                  {children}
                </AdminSiteChrome>
                <Analytics />
                <Toaster />
                <CookieBanner />
              </CookieBannerProvider>
            </AppProviders>
          </ParticipantCategoriesProvider>
        </MainContextProvider>
      </body>
    </html>
  );
}
