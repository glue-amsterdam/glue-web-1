import Participants from "@/app/components/about/participants";

import { fetchUserAboutParticipants } from "@/utils/api/about-api-calls";
import React from "react";

async function AboutParticipants() {
  const { participants, headerData } = await fetchUserAboutParticipants();

  return <Participants headerData={headerData} participants={participants} />;
}

export default AboutParticipants;
