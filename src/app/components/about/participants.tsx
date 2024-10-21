"use client";
import ParticipantsSection from "@/app/components/about/participants-section";
import { Member } from "@/utils/member-types";
import GlueLogo from "@/app/components/glue-logo";
import { useColors } from "@/app/context/MainContext";

interface Props {
  participants: Member[];
}

function Participants({ participants }: Props) {
  const colors = useColors();

  const { box1: box1Color, box2: box2Color } = colors;
  return (
    <div className="h-screen relative snap-start bg-uiwhite">
      <div className="absolute z-10 bottom-0 md:bottom-20 right-0 md:right-10">
        <div className="relative size-32 md:size-40 lg:size-52">
          <GlueLogo fill className="invert opacity-10 md:opacity-30" />
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
      <ParticipantsSection participants={participants} />
    </div>
  );
}

export default Participants;
