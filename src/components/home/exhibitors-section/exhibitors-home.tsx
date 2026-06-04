import BigButton from "../../big-button";
import ExhibitorsGrid from "@/components/exhibitors/exhibitors-grid";
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
  const page_texts = {
    title: "Exhibitors 2026",
  };

  const exhibitors = await loadHomeExhibitors();

  return (
    <section id="exhibitors-home" className="main-padding">
      <h2 className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">
        {page_texts.title.toUpperCase()}
      </h2>
      <ExhibitorsGrid exhibitors={exhibitors} loading={false} mode="section" />
      <div className="pt-[40px] lg:pt-[60px] flex justify-center">
        <BigButton as="link" label="view all" href="/exhibitors" mode="big" />
      </div>
    </section>
  );
};

export default ExhibitorsHome;
