import type { Metadata } from "next";
import "@/app/globals.css";
import NavbarBurguer from "@/app/components/navbar/responsive-navbar-with-hamburger";
import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { MainDataProvider } from "@/app/context/MainDataProvider";
import { LoadingFallback } from "@/app/components/loading-fallback";
import { CookieBanner } from "@/components/cookies/cookies-banner";
import { config } from "@/env";

export const metadata: Metadata = {
  title: `GLUE ${config.cityName}`,
  description: `GLUE ${config.cityName} connected by design`,
  openGraph: {
    title: "GLUE",
    url: "",
    description: "",
    images: "",
    type: "website",
  },
  twitter: {
    title: "GLUE",
    card: "summary_large_image",
    description: `GLUE ${config.cityName} connected by design`,
    site: "",
    images: "",
  },
  icons: [
    {
      url: `/favicons/${config.cityName}.ico`,
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-lausanne text-uiwhite antialiased min-h-dvh">
        <Suspense fallback={<LoadingFallback />}>
          <MainDataProvider>
            <AuthProvider>
              <NavbarBurguer />
              <div className="flex-grow overflow-x-hidden">{children}</div>
              <Toaster />
              <CookieBanner />
            </AuthProvider>
          </MainDataProvider>
        </Suspense>
      </body>
    </html>
  );
}
