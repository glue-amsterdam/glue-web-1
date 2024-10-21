"use client";

import InfoSection from "@/app/components/about/info-section";
import { useColors } from "@/app/context/MainContext";
import { InfoItem } from "@/utils/about-types";
import React from "react";

type Props = {
  infoItems: InfoItem[];
};

function Info({ infoItems }: Props) {
  const colors = useColors();

  const { box2: box2Color } = colors;
  return (
    <div style={{ backgroundColor: box2Color }} className="h-screen snap-start">
      <InfoSection infoItems={infoItems} />
    </div>
  );
}

export default Info;
