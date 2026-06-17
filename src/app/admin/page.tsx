import AdminDashboard from "@/components/admin/AdminDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GLUE Admin Dashboard",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
