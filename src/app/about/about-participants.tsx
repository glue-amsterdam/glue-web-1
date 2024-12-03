import Participants from "@/app/components/about/participants";
import { fetchAboutParticipants } from "@/lib/about/fetch-participants-section";

import React from "react";

async function AboutParticipants() {
  const { participants, headerData } = await fetchAboutParticipants();

  return <Participants headerData={headerData} participants={participants} />;
}

export default AboutParticipants;
