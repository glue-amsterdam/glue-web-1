import Background from "@/app/components/background";

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
    <main className="min-h-dvh bg-[var(--color-box3)]">
      {children}
      <Background />
    </main>
  );
}
