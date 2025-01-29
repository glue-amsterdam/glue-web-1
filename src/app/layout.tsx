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
  title: `GLUE ${config.cityName} | Connected by Design`,
  description: `Discover GLUE ${config.cityName}, where innovation meets creativity. Explore our events, design routes, and join a community connected by design.`,
  openGraph: {
    title: `GLUE ${config.cityName} | Connected by Design`,
    url: config.baseUrl,
    description: `Join GLUE ${config.cityName} and experience a world of design-driven innovation. Connect with us today!`,
    images: [
      {
        url: `${config.baseUrl}/${config.cityName}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `GLUE ${config.cityName} - Connected by Design`,
      },
    ],
    type: "website",
    siteName: `GLUE ${config.cityName}`,
  },
  twitter: {
    title: `GLUE ${config.cityName} | Connected by Design`,
    card: "summary_large_image",
    description: `Discover GLUE ${config.cityName}, where innovation meets creativity. Explore our events, design routes, and join a community connected by design.`,
    images: `${config.baseUrl}/${config.cityName}/tw-image.jpg`,
    site: config.cityName,
  },
  icons: [
    {
      url: `${config.baseUrl}/${config.cityName}/favicon.ico`,
      media: "(prefers-color-scheme: light)",
    },
    {
      url: `${config.baseUrl}/${config.cityName}/favicon.ico`,
      media: "(prefers-color-scheme: dark)",
    },
  ],

  keywords: [
    "GLUE",
    config.cityName,
    "design",
    "design routes",
    "design community",
    "innovation",
    "connected by design",
    "creative events",
    "urban design",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(config.baseUrl),
  alternates: {
    canonical: config.baseUrl,
  },
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
