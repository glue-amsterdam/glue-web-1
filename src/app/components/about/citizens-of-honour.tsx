"use client";

import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import { useColors } from "@/app/context/MainContext";
import { Citizen } from "@/utils/about-types";
import React from "react";

type Props = {
  initialCitizens: Citizen[];
};

function CitizenOfHonour({ initialCitizens }: Props) {
  const colors = useColors();

  const { box3: box3Color } = colors;
  return (
    <div
      style={{ backgroundColor: box3Color }}
      className="h-screen snap-start relative"
    >
      <div className="citizens-bg bg-uiwhite" />

      <CitizenOfHonourSection initialCitizens={initialCitizens} />
    </div>
  );
}

export default CitizenOfHonour;
