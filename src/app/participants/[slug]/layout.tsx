import { LoadingFallback } from "@/app/components/loading-fallback";
import { Suspense } from "react";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="bg-[var(--color-box1)] lg:h-screen">{children}</div>
    </Suspense>
  );
}
