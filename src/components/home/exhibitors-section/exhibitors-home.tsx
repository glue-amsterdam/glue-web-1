import BigButton from "../../big-button";
import ExhibitorsGrid from "@/components/exhibitors/exhibitors-grid";
import { getCachedHomeExhibitorsHeader } from "@/lib/participants/cached-home-exhibitors-header";
import { fetchRandomHomeExhibitors } from "@/lib/participants/fetch-random-home-exhibitors";
import type { ExhibitorItem } from "@/lib/participants/exhibitor-types";

const loadHomeExhibitors = async (): Promise<ExhibitorItem[]> => {
  try {
    return await fetchRandomHomeExhibitors();
  } catch (error) {
    console.error("[home] Failed to load exhibitors:", error);
    return [];
  }
};

const ExhibitorsHome = async () => {
  const [header, exhibitors] = await Promise.all([
    getCachedHomeExhibitorsHeader(),
    loadHomeExhibitors(),
  ]);

  if (!header.is_visible) {
    return null;
  }

  return (
    <section id="exhibitors-home" className="main-padding">
      <ExhibitorsGrid
        exhibitors={exhibitors}
        loading={false}
        mode="section"
        title={header.title}
        description={header.description}
      />
      <div className="pt-[40px] lg:pt-[60px] flex justify-center">
        <BigButton as="link" label="view all" href="/exhibitors" mode="big" />
      </div>
    </section>
  );
};

export default ExhibitorsHome;
