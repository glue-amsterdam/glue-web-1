import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ParticipantSectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
  server?: boolean;
};

export const ParticipantSection = ({
  id,
  title,
  children,
  className,
  server = false,
}: ParticipantSectionProps) => (
  <section
    id={id}
    className=""
  >
    <h2 className={
      cn("title-text", className, server && "sr-only")
    }>{title}</h2>
    {children}
  </section>
);
