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
    <main className="h-full flex flex-col min-h-0" data-page-container>
      {children}
    </main>
  );
}
