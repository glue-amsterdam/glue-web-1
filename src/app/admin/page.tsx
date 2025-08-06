import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminPage() {
  return (
    <div className="min-h-dvh h-full bg-[var(--color-box2)] pt-[6rem]">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-md">
        <AdminHeader />
        <AdminDashboard />
      </div>
    </div>
  );
}
