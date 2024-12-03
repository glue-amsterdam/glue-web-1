import Info from "@/app/components/about/info";
import { fetchInfoSection } from "@/lib/about/fetch-info-section";

export default async function AboutInfo() {
  const infoItemsSection = await fetchInfoSection();

  if (!infoItemsSection || !infoItemsSection.infoItems) {
    console.error(
      "Invalid or missing infoItemsSection data:",
      infoItemsSection
    );
    return (
      <div>Error: Unable to load info section. Please try again later.</div>
    );
  }

  return <Info infoItemsSection={infoItemsSection} />;
}
