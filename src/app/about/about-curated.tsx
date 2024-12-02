import CuratedMembers from "@/app/components/about/curated-participants";
import { fetchUserCurated } from "@/utils/api/about-api-calls";
import React from "react";

async function AboutCurated() {
  const curatedData = await fetchUserCurated();

  return (
    <CuratedMembers
      headerData={curatedData.headerData}
      curatedParticipants={curatedData.curatedParticipants}
    />
  );
}

export default AboutCurated;
