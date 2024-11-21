import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import NavbarBurguer from "@/app/components/navbar/responsive-navbar-with-hamburger";
import { AuthProvider } from "@/app/context/AuthContext";
import { MainContextProvider } from "@/app/context/MainContext";
import { fetchMain } from "@/utils/api";
import { Toaster } from "@/components/ui/toaster";

const lausanne = localFont({
  src: [
    {
      path: "./fonts/lausanne/lausanne.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/lausanne/lausanne-italic.ttf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-lausanne-300",
});

export const metadata: Metadata = {
  title: "GLUE",
  description: "GLUE connected by desing",
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
    description: "GLUE Dallas connected by desing",
    site: "",
    images: "",
  },
  icons: [
    {
      url: "/favicons/ligthFavicon.ico",
      media: "(prefers-color-scheme: light)",
    },
    {
      url: "/favicons/favicon.ico",
      media: "(prefers-color-scheme: dark)",
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mainSection = await fetchMain();
  return (
    <html lang="en">
      <AuthProvider>
        <MainContextProvider
          mainColors={mainSection.mainColors}
          mainLinks={mainSection.mainLinks}
          mainMenu={mainSection.mainMenu}
          eventsDays={mainSection.eventsDays}
        >
          <body
            className={`${lausanne.className} text-uiwhite antialiased min-h-dvh`}
          >
            <NavbarBurguer />
            <div className="flex-grow overflow-x-hidden">{children}</div>
            <Toaster />
          </body>
        </MainContextProvider>
      </AuthProvider>
    </html>
  );
}
