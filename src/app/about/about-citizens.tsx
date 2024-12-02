import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import { fetchCitizensOfHonor } from "@/utils/api/about-api-calls";
import React from "react";

async function AboutCitizens() {
  const citizensData = await fetchCitizensOfHonor();

  return (
    <CitizenOfHonourSection
      title={citizensData.title}
      description={citizensData.description}
      citizensByYear={citizensData.citizensByYear}
    />
  );
}

export default AboutCitizens;
