import { LoadingFallback } from "@/app/components/loading-fallback";
import { Suspense } from "react";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <main className="bg-[var(--color-box1)] relative h-[100dvh] overflow-hidden">
        {children}
      </main>
    </Suspense>
  );
}
