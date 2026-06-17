import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GLUE Admin",
  description: "Administration panel for GLUE platform moderators.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
