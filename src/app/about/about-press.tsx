import Press from "@/app/components/about/press";
import { fetchPressSection } from "@/lib/about/fetch-press-section";

export default async function AboutPress() {
  const pressSectionData = await fetchPressSection();

  if (!pressSectionData || !pressSectionData.pressItems) {
    console.error(
      "Invalid or missing infoItemsSection data:",
      pressSectionData
    );
    return (
      <div>Error: Unable to load info section. Please try again later.</div>
    );
  }

  return <Press pressItemsSection={pressSectionData} />;
}
