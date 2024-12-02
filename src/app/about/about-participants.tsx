import Participants from "@/app/components/about/participants";
import { fetchAboutParticipants } from "@/utils/api/about-api-calls";

import React from "react";

async function AboutParticipants() {
  const { participants, headerData } = await fetchAboutParticipants();

  return <Participants headerData={headerData} participants={participants} />;
}

export default AboutParticipants;
