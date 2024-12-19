type Props = {
  children: React.ReactNode;
};

export const metadata = {
  title: "GLUE Design Routes Participants",
  description: "Explore the talented participants of GLUE design routes.",
};

export default function ParticipantsLayout({ children }: Props) {
  return <main className="bg-[var(--color-box2)] min-h-dvh">{children}</main>;
}
