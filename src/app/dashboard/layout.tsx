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
      className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden"
      data-page-container
    >
      {children}
    </main>
  );
}
