import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavbarBurguer from "./components/navbar/responsive-navbar-with-hamburger";
import { AuthProvider } from "./components/login-form/auth-context";

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
      url: "favicons/ligthFavicon.ico",
      media: "(prefers-color-scheme: light)",
    },
    {
      url: "favicons/favicon.ico",
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
      <AuthProvider>
        <body className={`${lausanne.className} text-uiwhite antialiased`}>
          <NavbarBurguer />
          {children}
        </body>
      </AuthProvider>
    </html>
  );
}
