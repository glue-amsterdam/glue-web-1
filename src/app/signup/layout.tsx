import LoadingSpinner from "@/app/components/LoadingSpinner";
import { NAVBAR_HEIGHT } from "@/constants";
import React, { Suspense } from "react";

type Props = {
  children: React.ReactNode;
};

function SignUpLayout({ children }: Props) {
  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="min-h-screen bg-black"
    >
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}

export default SignUpLayout;
