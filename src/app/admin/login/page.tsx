import AdminLoginForm from "@/app/api/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="bg-[var(--color-box2)] flex justify-center pt-[6rem] min-h-screen h-full pb-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md h-fit">
        <h1 className="text-2xl font-bold mb-6 text-center text-uiblack">
          GLUE Admin Login
        </h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
