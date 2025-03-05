import LoadingSpinner from "@/app/components/LoadingSpinner";
import { NAVBAR_HEIGHT } from "@/constants";
import type React from "react";
import { Suspense } from "react";

type Props = {
  children: React.ReactNode;
};

function SignUpLayout({ children }: Props) {
  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="bg-[var(--color-box3)] min-h-screen flex flex-col"
    >
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}

export default SignUpLayout;
