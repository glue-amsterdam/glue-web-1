import Background from "@/app/components/background";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh">
      {children}
      <Background />
    </main>
  );
}
