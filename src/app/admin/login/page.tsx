import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NAVBAR_HEIGHT } from "@/constants";
import AdminLoginForm from "@/app/admin/login/admin-login-form";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (adminToken) {
    redirect("/admin");
  }

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="bg-gradient-to-br from-blue-50 to-white flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">
          GLUE Admin Login
        </h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
