import { Analytics } from '@vercel/analytics/next'
import "@/app/globals.css";
import { LayoutMetadata } from "@/lib/metadata";

import { fetchMain } from "@/lib/main/fetch-main";
import { getTheme } from "@/lib/theme";


import { AuthProvider } from "@/app/context/AuthContext";
import { VisitorProvider } from "@/app/context/VisitorContext";
import { MainContextProvider } from "./context/MainContext";

import { Toaster } from "@/components/ui/toaster";

import { CookieBanner } from "@/components/cookies/cookies-banner";
import InternalNavigationTracker from "@/components/internal-navigation-tracker";
import NavBar from "@/components/navbar";
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
  const theme = await getTheme()

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
          <AuthProvider>
            <VisitorProvider>
              <InternalNavigationTracker />
              <NavBar />
              {children}
              <Footer />
              <Analytics />
              <Toaster />
              <CookieBanner />
            </VisitorProvider>
          </AuthProvider>
        </MainContextProvider>
      </body>
    </html>

  );
}
