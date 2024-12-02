import Info from "@/app/components/about/info";
import { fetchInfoSection } from "@/utils/api/about-api-calls";

export default async function AboutInfo() {
  const infoItemsSection = await fetchInfoSection();

  return <Info infoItemsSection={infoItemsSection} />;
}
