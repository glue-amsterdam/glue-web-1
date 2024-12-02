import CitizensForm from "@/app/admin/components/citizents-form/citizens-form";
import { fetchAboutCitizens, fetchYears } from "@/utils/api/admin-api-calls";

export default async function AboutCitizensSection() {
  const citizensData = await fetchAboutCitizens();
  const years = await fetchYears();

  return <CitizensForm initialData={citizensData} years={years} />;
}
