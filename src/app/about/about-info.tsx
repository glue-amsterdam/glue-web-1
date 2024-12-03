import Info from "@/app/components/about/info";
import { fetchInfoSection } from "@/lib/about/fetch-info-section";

export default async function AboutInfo() {
  const infoItemsSection = await fetchInfoSection();

  return <Info infoItemsSection={infoItemsSection} />;
}
