import { Analytics } from '@vercel/analytics/next'
import "@/app/globals.css";
import { LayoutMetadata } from "@/lib/metadata";

import { fetchMain } from "@/lib/main/fetch-main";
import { getTheme } from "@/lib/theme";


import { AppProviders } from "@/app/components/app-providers";
import { MainContextProvider } from "./context/MainContext";
import { getNavbarInitialIdentity } from "@/lib/users/get-navbar-initial-identity";

import { Toaster } from "@/components/ui/toaster";

import { CookieBanner } from "@/components/cookies/cookies-banner";
import InternalNavigationTracker from "@/components/internal-navigation-tracker";
import Footer from '@/components/home/bottom-navigation/bottom-navigation';

export const metadata = LayoutMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  //OLDER VERSION
  const initialData = await fetchMain();

  //NEW VERSION
  const theme = await getTheme();
  const navbarInitialIdentity = await getNavbarInitialIdentity();

  return (
    <html
      lang="en"
      style={
        {
          '--primary-color': theme.primaryColor,
          '--background-color': theme.backgroundColor,
          '--black-color': theme.blackColor,
          '--gray-color': "#DADADA",
          '--white-color': theme.whiteColor,
          '--up-to-three-participants-color': theme.upToThreeParticipantsColor,
          '--hub-color': theme.hubColor,
          '--special-program-color': theme.specialProgramColor,
        } as React.CSSProperties
      }
    >
      <body className="font-lausanne bg-(--background-color)">
        <MainContextProvider initialData={initialData}>
          <AppProviders navbarInitialIdentity={navbarInitialIdentity}>
            <InternalNavigationTracker />
            {children}
            <Footer />
            <Analytics />
            <Toaster />
            <CookieBanner />
          </AppProviders>
        </MainContextProvider>
      </body>
    </html>

  );
}
