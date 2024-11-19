"use client";
import ParticipantsSection from "@/app/components/about/participants-section";

import GlueLogo from "@/app/components/glue-logo";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { ParticipantsSectionContent } from "@/schemas/baseSchema";
import { ParticipantUser } from "@/schemas/usersSchemas";
import { useRef } from "react";

interface ParticipantsProps {
  headerData: ParticipantsSectionContent;
  participants: ParticipantUser[];
}

export default function Participants({
  headerData,
  participants,
}: ParticipantsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="participants"
      areia-label="participants-content"
      aria-labelledby="participants-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh relative w-full flex flex-col justify-center items-center snap-start bg-uiwhite`}
    >
      <ParticipantsSection
        description={headerData.description}
        title={headerData.title}
        participants={participants}
      />
      <ParticipantsBackground />
    </section>
  );
}

function ParticipantsBackground() {
  const colors = useColors();

  const { box1: box1Color, box2: box2Color } = colors;
  return (
    <>
      <div className="absolute bottom-0 right-0 md:right-10 ">
        <div className="relative size-32 md:size-40 lg:size-52">
          <GlueLogo fill className="invert opacity-10 md:opacity-20" />
        </div>
      </div>
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="relative">
          <div
            style={{ background: box1Color }}
            className={`participants-bg`}
          />
        </div>
        <div className="relative">
          <div
            style={{ background: box2Color }}
            className="participants-bg-r"
          />
        </div>
      </div>
    </>
  );
}
