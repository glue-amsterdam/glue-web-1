import { LoadingFallback } from "@/app/components/loading-fallback";
import { NAVBAR_HEIGHT } from "@/constants";
import { Suspense } from "react";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <main
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
        className="bg-[var(--color-box1)] relative min-h-screen flex flex-col"
      >
        {children}
      </main>
    </Suspense>
  );
}
