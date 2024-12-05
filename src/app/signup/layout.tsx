import CenteredLoader from "@/app/components/centered-loader";
import React, { Suspense } from "react";

type Props = {
  children: React.ReactNode;
};

function SignUpLayout({ children }: Props) {
  return (
    <div className="bg-black">
      <Suspense fallback={<CenteredLoader />}>{children}</Suspense>
    </div>
  );
}

export default SignUpLayout;
