import CuratedMembers from "@/app/components/about/curated-participants";
import { fetchUserCurated } from "@/utils/api/about-api-calls";
import React from "react";

async function AboutCurated() {
  const { curatedParticipants, headerData } = await fetchUserCurated();

  return (
    <CuratedMembers
      headerData={headerData}
      curatedParticipants={curatedParticipants}
    />
  );
}

export default AboutCurated;
