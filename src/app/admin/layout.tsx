import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GLUE Admin Dashboard",
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

function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="text-uiblack pt-32">{children}</div>;
}

export default AdminLayout;
