import { cookies } from "next/headers";
import { NAVBAR_HEIGHT } from "@/constants";
import AdminHeader from "./components/admin-header";
import AdminDashboard from "@/app/admin/admin-dashboard";
import AdminLoginForm from "@/app/admin/login/admin-login-form";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  const isAdmin = adminToken !== undefined;
  const adminName = "Admin"; // You might want to fetch this from a database or JWT

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="min-h-dvh bg-gradient-to-br from-blue-50 to-white"
    >
      <div className="container mx-auto p-4">
        {isAdmin ? (
          <>
            <AdminHeader adminName={adminName} />
            <AdminDashboard />
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">
              GLUE Admin
            </h1>
            <AdminLoginForm />
          </>
        )}
      </div>
    </div>
  );
}
