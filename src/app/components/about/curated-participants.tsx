"use client";

import CuratedMembersSection from "@/app/components/about/curated-participants-section";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { CuratedMemberSectionHeader } from "@/schemas/curatedSchema";
import { CuratedParticipantWhitYear } from "@/schemas/usersSchemas";
import React, { useRef } from "react";

type Props = {
  headerData: CuratedMemberSectionHeader;
  curatedParticipants: Record<number, CuratedParticipantWhitYear[]>;
};

function CuratedMembers({ headerData, curatedParticipants }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();
  return (
    <section
      ref={sectionRef}
      id="curated"
      aria-label="curated-members-content"
      aria-labelledby="curated-members-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-center relative bg-[var(--color-box3)] `}
    >
      <CuratedMembersSection
        title={headerData.title}
        description={headerData.description}
        curatedParticipants={curatedParticipants}
      />
    </section>
  );
}

export default CuratedMembers;
