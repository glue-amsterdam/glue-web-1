import LoadingSpinner from "@/app/components/LoadingSpinner";
import type React from "react";
import { Suspense } from "react";

type Props = {
  children: React.ReactNode;
};

function SignUpLayout({ children }: Props) {
  return (
    <div className="bg-[var(--color-box3)] min-h-screen flex flex-col pt-[5rem]">
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}

export default SignUpLayout;
