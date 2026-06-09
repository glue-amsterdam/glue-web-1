import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata = {
  title: "GLUE Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
