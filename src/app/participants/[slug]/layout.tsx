"use client";

import CenteredLoader from "@/app/components/centered-loader";
import ErrorBoundary from "@/app/components/error-boundary";
import { useColors } from "@/app/context/MainContext";
import { Suspense } from "react";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colors = useColors();

  return (
    <main
      style={{
        backgroundColor: colors?.box1,
      }}
      className="relative h-[100dvh] overflow-hidden"
    >
      <ErrorBoundary error={new Error("Participant page error")}>
        <Suspense fallback={<CenteredLoader />}>{children}</Suspense>
      </ErrorBoundary>
    </main>
  );
}
