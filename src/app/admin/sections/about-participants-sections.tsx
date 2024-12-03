"use client";

import useSWR from "swr";
import ParticipantsSectionForm from "@/app/admin/forms/about-participants-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { ParticipantsSectionHeader } from "@/schemas/participantsAdminSchema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutParticipantsSection() {
  const {
    data: particpantsHeader,
    error,
    isLoading,
  } = useSWR<ParticipantsSectionHeader>(
    "/api/admin/about/participants",
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load participants data</div>;
  if (!particpantsHeader) return <div>No participants data available</div>;

  return <ParticipantsSectionForm initialData={particpantsHeader} />;
}
