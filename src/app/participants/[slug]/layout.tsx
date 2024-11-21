"use client";

import CenteredLoader from "@/app/components/centered-loader";
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
      <Suspense fallback={<CenteredLoader />}>{children}</Suspense>
    </main>
  );
}
