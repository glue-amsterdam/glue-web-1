import { cookies } from "next/headers";
import AdminDashboard from "./admin-dashboard";
import { NAVBAR_HEIGHT } from "@/constants";
import AdminLoginForm from "@/app/admin/login/admin-login-form";
import LogoutButton from "@/app/admin/components/log-out-button";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  const isAdmin = adminToken !== undefined;
  const adminName = "Admin";

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`min-h-dvh bg-gradient-to-br `}
    >
      <div className="container mx-auto p-4">
        {isAdmin ? (
          <>
            <div className="flex gap-2 justify-end items-center mb-4">
              <p className="text-lg">Welcome, {adminName}!</p>
              <LogoutButton />
            </div>
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
