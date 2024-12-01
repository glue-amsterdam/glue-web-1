import Info from "@/app/components/about/info";
import { fetchAboutInfo } from "@/utils/api/admin-api-calls";

export default async function AboutInfo() {
  const infoItemsSection = await fetchAboutInfo();

  return <Info infoItemsSection={infoItemsSection} />;
}
