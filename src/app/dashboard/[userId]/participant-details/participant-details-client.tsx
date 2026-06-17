"use client";

import { ParticipantDetailsForm } from "@/app/dashboard/[userId]/participant-details/participant-details-form";
import type { ParticipantProfileData } from "@/lib/dashboard/get-participant-profile-data";
import type { PressKitLink } from "@/schemas/mainSchema";

type ParticipantDetailsClientProps = {
  targetUserId: string;
  isMod: boolean;
  profileData: ParticipantProfileData;
  pressKitLinks: PressKitLink[];
};

export const ParticipantDetailsClient = ({
  targetUserId,
  isMod,
  profileData,
  pressKitLinks,
}: ParticipantDetailsClientProps) => (
  <ParticipantDetailsForm
    key={targetUserId}
    targetUserId={targetUserId}
    isMod={isMod}
    participantDetails={profileData.participantDetails}
    visitingHours={profileData.visitingHours}
    invoiceData={profileData.invoiceData}
    profileImages={profileData.profileImages}
    planMaxImages={profileData.planMaxImages}
    plans={profileData.plans}
    pressKitLinks={pressKitLinks}
  />
);
