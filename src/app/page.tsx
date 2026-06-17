import { config } from "@/config";
import type { Metadata } from "next";

import { loadHomePageData } from "@/lib/home/load-home-page-data";
import { getCachedMainLinks } from "@/lib/main/get-main-links";
import { getOrganizationSameAs } from "@/lib/seo/organization-same-as";

import MainContainer from "@/components/main-container";
import Hero from "@/components/home/hero-section/hero";
import ExhibitorsHome from "@/components/home/exhibitors-section/exhibitors-home";
import CreativeCitizensOfHonour from "@/components/home/citizens-of-honour-section/creative-citizens-of-honour";
import CmsTextSection from "@/components/cms/cms-text-section";
import StickyParticipantsSection from "@/components/home/sticky-participants-section/sticky-participants-section";
import HomePostsSection from "@/components/home/posts-section/home-posts-section";
import BottomBlock from "@/components/bottom-block";
import Separator from "@/components/separator";

export const revalidate = 2_592_000;

const buildHomeStructuredData = (sameAs: string[]) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: `GLUE ${config.cityName}`,
      url: config.baseUrl,
      description: `GLUE ${config.cityName} design route — connected by design.`,
    },
    {
      "@type": "Organization",
      name: `GLUE ${config.cityName}`,
      url: config.baseUrl,
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const mainLinks = await getCachedMainLinks();
  const sameAs = getOrganizationSameAs(mainLinks);

  return {
    alternates: {
      canonical: config.baseUrl,
    },
    other: {
      "application/ld+json": JSON.stringify(buildHomeStructuredData(sameAs)),
    },
  };
}

export default async function Page() {
  const { stickyGroupData, citizensData, homeHeroData } = await loadHomePageData();

  return (
    <main id="main-content" className="first-padding">
      <MainContainer className="stagger-enter">
        <Hero
          videoUrl={homeHeroData.videoUrl}
          posterUrl={homeHeroData.posterUrl}
          description={homeHeroData.description}
        />
        <ExhibitorsHome />
        <Separator />
        <CmsTextSection slug="become-an-exhibitor" />

        <CreativeCitizensOfHonour data={citizensData} />
        <Separator />
        <CmsTextSection slug="alternatives-unexpected" />

        <StickyParticipantsSection data={stickyGroupData} />
        <Separator />
        <CmsTextSection slug="newsletter" />
        <Separator />
        <HomePostsSection />

        <BottomBlock />
      </MainContainer>
    </main>
  );
}
