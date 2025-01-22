import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import { fetchCitizensOfHonor } from "@/lib/about/fetch-citizens-section";
import React from "react";

async function AboutCitizens() {
  const citizensData = await fetchCitizensOfHonor();

  if (!citizensData.is_visible) {
    return null;
  }

  return (
    <CitizenOfHonourSection
      title={citizensData.title}
      description={citizensData.description}
      is_visible={citizensData.is_visible}
      citizensByYear={citizensData.citizensByYear}
    />
  );
}

export default AboutCitizens;
