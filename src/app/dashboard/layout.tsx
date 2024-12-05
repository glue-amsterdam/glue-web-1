import Background from "@/app/components/background";
import LoginModalWrapper from "@/app/components/login-modal-wrapper";
import { cookies } from "next/headers";

export const metadata = {
  title: "GLUE Dashboard",
  description: "Admin dashboard for GLUE users",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const loginRequired = cookieStore.get("login_required")?.value === "true";
  return (
    <main className="min-h-dvh">
      {loginRequired && (
        <LoginModalWrapper initialLoginRequired={loginRequired} />
      )}
      {children}
      <Background />
    </main>
  );
}
