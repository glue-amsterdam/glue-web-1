import React from "react";

type Props = {
  children: React.ReactNode;
};

function AboutLayout({ children }: Props) {
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {children}
    </main>
  );
}

export default AboutLayout;
