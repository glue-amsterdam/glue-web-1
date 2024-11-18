import React from "react";

type Props = {
  children: React.ReactNode;
};

function SignUpLayout({ children }: Props) {
  return <div className="bg-black">{children}</div>;
}

export default SignUpLayout;
