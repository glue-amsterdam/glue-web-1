import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GLUE Admin Dashboard",
};

function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="text-uiblack pt-32">{children}</div>;
}

export default AdminLayout;
