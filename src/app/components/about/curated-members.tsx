"use client";

import CuratedMembersSection from "@/app/components/about/curated-members-section";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { CuratedMemberSectionContent } from "@/utils/about-types";
import React, { useRef } from "react";

type Props = {
  curatedMembersSection: CuratedMemberSectionContent;
};

function CuratedMembers({ curatedMembersSection }: Props) {
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
      style={{ backgroundColor: box3Color }}
      className="h-screen pt-[5rem] snap-center relative"
    >
      <CuratedMembersSection
        title={curatedMembersSection.title}
        description={curatedMembersSection.description}
        curatedMembers={curatedMembersSection.curatedMembers}
      />
    </section>
  );
}

export default CuratedMembers;
