import InfoItemsForm from "@/app/admin/forms/info-items-form";
import { fetchAboutInfo } from "@/utils/api/admin-api-calls";

export default async function AboutInfoSection() {
  const infoItemsSection = await fetchAboutInfo();

  return <InfoItemsForm initialData={infoItemsSection} />;
}
