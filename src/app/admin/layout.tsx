import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GLUE Admin Dashboard",
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

function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="text-uiblack">{children}</div>;
}

export default AboutLayout;
