import type { Metadata } from "next";
import "@/app/globals.css";
import NavbarBurguer from "@/app/components/navbar/responsive-navbar-with-hamburger";
import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { MainDataProvider } from "@/app/context/MainDataProvider";
import { LoadingFallback } from "@/app/components/loading-fallback";
import { CookieBanner } from "@/components/cookies/cookies-banner";

export const metadata: Metadata = {
  title: `GLUE ${process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT}`,
  description: `GLUE ${process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT} connected by design`,
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
    description: `GLUE ${process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT} connected by design`,
    site: "",
    images: "",
  },
  icons: [
    {
      url: "/ligthFavicon.ico",
      media: "(prefers-color-scheme: light)",
    },
    {
      url: "/favicon.ico",
      media: "(prefers-color-scheme: dark)",
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
