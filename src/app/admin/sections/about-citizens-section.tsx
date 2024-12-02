import { fetchAboutCitizens } from "@/utils/api/admin-api-calls";
import CitizensForm from "@/app/admin/forms/about-citizens-form";

export default async function AboutCitizensSection() {
  const citizensData = await fetchAboutCitizens();

  return <CitizensForm initialData={citizensData} />;
}
