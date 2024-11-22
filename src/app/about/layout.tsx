type Props = {
  children: React.ReactNode;
};

export const metadata = {
  title: "GLUE About Page",
  description:
    "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
};

function AboutLayout({ children }: Props) {
  return (
    <main className="h-dvh overflow-x-hidden snap-y snap-mandatory scroll-smooth">
      {children}
    </main>
  );
}

export default AboutLayout;
