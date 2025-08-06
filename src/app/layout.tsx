import type { Metadata } from "next";
import "@/app/globals.css";

import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/cookies/cookies-banner";
import { config } from "@/env";
import { MainContextProvider } from "./context/MainContext";
import { fetchMain } from "@/lib/main/fetch-main";
import { ViewTransitions } from "next-view-transitions";

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
  const initialData = await fetchMain();
  return (
    <ViewTransitions>
      <html lang="en">
        <body className="font-lausanne text-uiwhite">
          <MainContextProvider initialData={initialData}>
            <AuthProvider>
              {children}
              <Toaster />
              <CookieBanner />
            </AuthProvider>
          </MainContextProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
