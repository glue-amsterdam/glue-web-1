import CenteredLoader from "@/app/components/centered-loader";

import { Suspense } from "react";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-[var(--color-box1)] relative h-[100dvh] overflow-hidden">
      <Suspense fallback={<CenteredLoader />}>{children}</Suspense>
    </main>
  );
}
