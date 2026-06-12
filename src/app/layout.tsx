import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";
import { LayoutMetadata } from "@/lib/metadata";

import { fetchMain } from "@/lib/main/fetch-main";
import { getTheme } from "@/lib/theme";
import { buildNavbarLinks } from "@/lib/nav/build-navbar-links"; 1450

import { AppProviders } from "@/components/app-providers";
import { MainContextProvider } from "../context/MainContext";
import { getNavbarInitialIdentity } from "@/lib/users/get-navbar-initial-identity";
import { AdminSiteChrome } from "@/components/admin/admin-site-chrome";

import { Toaster } from "@/components/ui/toaster";

import { CookieBanner } from "@/components/cookies/cookies-banner";
import InternalNavigationTracker from "@/components/internal-navigation-tracker";

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

  return (
    <html
      lang="en"
      style={
        {
          "--primary-color": theme.primaryColor,
          "--background-color": theme.backgroundColor,
          "--black-color": theme.blackColor,
          "--gray-color": "#DADADA",
          "--white-color": theme.whiteColor,
          "--up-to-three-participants-color": theme.upToThreeParticipantsColor,
          "--hub-color": theme.hubColor,
          "--special-program-color": theme.specialProgramColor,
          "--hub-font-color": theme.hubFontColor,
          "--up-to-three-participants-font-color":
            theme.upToThreeParticipantsFontColor,
          "--special-program-font-color": theme.specialProgramFontColor,

        } as React.CSSProperties
      }
    >
      <body className="font-lausanne bg-(--background-color)">
        <MainContextProvider initialData={initialData}>
          <AppProviders>
            <AdminSiteChrome
              navbarInitialIdentity={navbarInitialIdentity}
              navLinks={navLinks}
              homeTexts={theme.homeTexts}
            >
              <InternalNavigationTracker />
              {children}
            </AdminSiteChrome>
            <Analytics />
            <Toaster />
            <CookieBanner />
          </AppProviders>
        </MainContextProvider>
      </body>
    </html>
  );
}
