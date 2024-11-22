export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-[var(--color-box1)] relative h-[100dvh] overflow-hidden">
      {children}
    </main>
  );
}
