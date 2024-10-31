import DashboardMenu from "@/app/components/dashboard/dashboard-menu";
import { NAVBAR_HEIGHT } from "@/constants";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`flex h-dvh z-10 relative`}
    >
      <DashboardMenu />
      <section className="flex-1 p-10 overflow-auto">{children}</section>
    </div>
  );
}
