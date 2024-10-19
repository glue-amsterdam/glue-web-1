import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import { Citizen } from "@/utils/about-types";
import React from "react";

type Props = {
  box3Color: string;
  initialCitizens: Citizen[];
};

function CitizenOfHonour({ initialCitizens, box3Color }: Props) {
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
