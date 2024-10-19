import InfoSection from "@/app/components/about/info-section";
import { InfoItem } from "@/utils/about-types";
import React from "react";

type Props = {
  infoItems: InfoItem[];
  box2Color: string;
};

function Info({ infoItems, box2Color }: Props) {
  return (
    <div style={{ backgroundColor: box2Color }} className="h-screen snap-start">
      <InfoSection infoItems={infoItems} />
    </div>
  );
}

export default Info;
