import NavBar from "@/components/NavBar";

type Props = {
  children: React.ReactNode;
};

export const metadata = {
  title: "GLUE Participant",
  description: "Explore the talented participants of GLUE design routes.",
};

export default function ParticipantsLayout({ children }: Props) {
  return (
    <main>
      <NavBar />
      {children}
    </main>
  );
}
