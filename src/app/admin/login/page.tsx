import AdminLoginForm from "@/app/api/admin/AdminLoginForm";
import BigButton from "@/components/big-button";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <div className="absolute left-4 top-4">
        <BigButton mode="big" as="link" href="/" label="Website" target="_blank" />
      </div>
      <h1 className="title-text mb-8 text-zinc-900">GLUE | Admin Dashboard</h1>
      <AdminLoginForm />
    </div>
  );
}
