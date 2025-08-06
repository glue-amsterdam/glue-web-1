import { fetchAboutParticipants } from "@/lib/about/fetch-participants-section";
import AboutClientPage from "./about-client-page";
import { fetchUserCarousel } from "@/lib/about/fetch-carousel-section";
import { fetchCitizensOfHonor } from "@/lib/about/fetch-citizens-section";
import { fetchCuratedSectionV2 } from "@/lib/about/fetch-curated-section-v2";
import { fetchInfoSection } from "@/lib/about/fetch-info-section";
import { fetchPressSection } from "@/lib/about/fetch-press-section";
import { fetchInternationalContent } from "@/lib/about/fetch-international-section";
import { fetchSponsorsData } from "@/lib/about/fetch-sponsors-section";

export default async function AboutPage() {
  const [
    carouselData,
    participantsData,
    citizensData,
    curatedData,
    infoSectionData,
    pressSectionData,
    glueInternational,
    sponsorsData,
  ] = await Promise.all([
    fetchUserCarousel(),
    fetchAboutParticipants(),
    fetchCitizensOfHonor(),
    fetchCuratedSectionV2(),
    fetchInfoSection(),
    fetchPressSection(),
    fetchInternationalContent(),
    fetchSponsorsData(),
  ]);
  return (
    <AboutClientPage
      curatedData={curatedData}
      carouselData={carouselData}
      participantsData={participantsData}
      citizensData={citizensData}
      infoSection={infoSectionData}
      pressSectionData={pressSectionData}
      glueInternational={glueInternational}
      sponsorsData={sponsorsData}
    />
  );
}
