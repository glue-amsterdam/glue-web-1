import DashboardBodyScrollLock from "@/app/dashboard/components/dashboard-body-scroll-lock";

export const metadata = {
  title: "GLUE Dashboard",
  description: "Admin dashboard for GLUE users",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="fixed inset-x-0 top-(--nav-total-h-mobile) lg:top-(--nav-primary-h) bottom-(--site-footer-h) z-40 flex min-h-0 flex-col overflow-hidden"
      data-page-container
      id="dashboard-layout"
    >
      <DashboardBodyScrollLock />
      {children}
    </main>
  );
}
