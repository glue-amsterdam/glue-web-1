import LogoutButton from "@/app/admin/components/log-out-button";

interface AdminHeaderProps {
  adminName: string;
}

export default function AdminHeader({ adminName }: AdminHeaderProps) {
  return (
    <div className="flex gap-2 justify-end items-center mb-4">
      <p className="text-lg">Welcome, {adminName}!</p>
      <LogoutButton />
    </div>
  );
}
