"use client";

import CuratedMembersSection from "@/app/components/about/curated-participants-section";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { CuratedMemberSectionContent } from "@/utils/about-types";
import { CuratedParticipantWhitYear } from "@/utils/user-types";
import React, { useRef } from "react";

type Props = {
  headerData: CuratedMemberSectionContent;
  curatedParticipants: Record<number, CuratedParticipantWhitYear[]>;
};

function CuratedMembers({ headerData, curatedParticipants }: Props) {
  const colors = useColors();
  const { box3: box3Color } = colors;

  const sectionRef = useRef<HTMLElement>(null);
  useScroll();
  return (
    <section
      ref={sectionRef}
      id="curated"
      aria-label="curated-members-content"
      aria-labelledby="curated-members-heading"
      style={{ backgroundColor: box3Color, paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-center relative`}
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
