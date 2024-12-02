import Info from "@/app/components/about/info";
import { fetchUserInfo } from "@/utils/api/about-api-calls";

export default async function AboutInfo() {
  const infoItemsSection = await fetchUserInfo();

  return <Info infoItemsSection={infoItemsSection} />;
}
