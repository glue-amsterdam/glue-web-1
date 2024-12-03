import CuratedMembers from "@/app/components/about/curated-participants";
import { fetchCuratedSection } from "@/lib/about/fetch-curated-section";
import React from "react";

async function AboutCurated() {
  const curatedData = await fetchCuratedSection();

  return (
    <CuratedMembers
      headerData={curatedData.headerData}
      curatedParticipants={curatedData.curatedParticipants}
    />
  );
}

export default AboutCurated;
