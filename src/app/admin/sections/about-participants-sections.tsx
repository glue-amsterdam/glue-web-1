import ParticipantsSectionForm from "@/app/admin/forms/participants-section-form";
import { fetchAboutParticipants } from "@/utils/api/admin-api-calls";

export default async function AboutParticipantsSection() {
  const carouselData = await fetchAboutParticipants();

  return <ParticipantsSectionForm initialData={carouselData} />;
}
