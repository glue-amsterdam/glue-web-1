import DashboardMenu from "@/app/components/dashboard/dashboard-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen z-10 relative">
      <DashboardMenu />
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}
