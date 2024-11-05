import React from "react";

type Props = {
  children: React.ReactNode;
};

function AboutLayout({ children }: Props) {
  return (
    <main className="h-dvh overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth">
      {children}
    </main>
  );
}

export default AboutLayout;