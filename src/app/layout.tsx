import type { Metadata } from "next";
import "@/app/globals.css";
import NavbarBurguer from "@/app/components/navbar/responsive-navbar-with-hamburger";
import { AuthProvider } from "@/app/context/AuthContext";
import { MainDataProvider } from "@/app/components/main-data-provider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import GlueLogo from "@/app/components/glue-logo";

export const metadata: Metadata = {
  title: "GLUE - Home",
  description: "GLUE connected by design",
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
    description: "GLUE Dallas connected by design",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-lausanne text-uiwhite antialiased min-h-dvh">
        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            <MainDataProvider>
              <NavbarBurguer />
              <div className="flex-grow overflow-x-hidden">{children}</div>
              <Toaster />
            </MainDataProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}

function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="size-56 animate-pulse animate relative">
        <GlueLogo fill className="filter" />
      </div>
    </div>
  );
}
