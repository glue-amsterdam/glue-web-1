import CuratedMembersSection from "@/app/components/about/curated-members-section";
import GlueConectedImage from "@/app/components/glue-connected-image";
import GlueLogo from "@/app/components/glue-logo";
import { CuratedMember } from "@/utils/about-types";
import React from "react";

type Props = {
  curatedMembers: CuratedMember[];
  box3Color: string;
};

function CuratedMembers({ curatedMembers, box3Color }: Props) {
  return (
    <div
      style={{ backgroundColor: box3Color }}
      className="h-screen snap-start relative"
    >
      <GlueConectedImage
        className="absolute bottom-0 invert opacity-20 md:opacity-50"
        width={250}
        height={100}
      />
      <div className="absolute right-20 top-10 rotate-[-40deg]">
        <div className="relative size-80">
          <GlueLogo fill className="opacity-20 md:opacity-50" />
        </div>
      </div>
      <div className="z-10">
        <CuratedMembersSection curatedMembers={curatedMembers} />
      </div>
    </div>
  );
}

export default CuratedMembers;
