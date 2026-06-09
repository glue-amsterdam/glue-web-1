import { config } from "@/config";

import AboutParticipantsForm from "@/components/admin/about/participants/AboutParticipantsForm";
import AboutCuratedHeaderForm from "@/components/admin/about/curated-sticky/AboutCuratedHeaderForm";
import AboutCitizensHeaderForm from "@/components/admin/about/citizens-of-honour/AboutCitizensHeaderForm";
import HomeHeroAdminForm from "@/components/admin/about/home/home-hero-admin-form";
import HomeTextsForm from "@/components/admin/home/home-texts-form";
import TextSectionAdminForm from "@/components/admin/text-sections/text-section-admin-form";
import type { TextSectionData } from "@/lib/text-sections/types";
import type { CitizensSectionHeader } from "@/schemas/citizenSchema";
import type { HomeHero } from "@/schemas/homeHeroSchema";
import type { HomeTextsFormData } from "@/schemas/mainSchema";
import Separator from "@/components/separator";

const fetchAboutParticipants = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/participants`);
  const data = await res.json();
  return data;
};

const fetchAboutCurated = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/curated`);
  const data = await res.json();
  return data;
};

const fetchAboutCitizensHeader = async (): Promise<CitizensSectionHeader> => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/citizens`);
  const data = await res.json();
  return {
    title: data.title,
    description: data.description,
    is_visible: data.is_visible,
  };
};

const fetchHomeHero = async (): Promise<HomeHero> => {
  const res = await fetch(`${config.baseApiUrl}/admin/home/hero`);
  const data = await res.json();
  return data;
};

const fetchHomeTexts = async (): Promise<HomeTextsFormData> => {
  const res = await fetch(`${config.baseApiUrl}/admin/main/home_text`, {
    cache: "no-store",
  });
  return res.json();
};

const fetchHomeTextSections = async (): Promise<TextSectionData[]> => {
  const res = await fetch(
    `${config.baseApiUrl}/admin/text-sections?group=home`,
    { cache: "no-store" }
  );
  return res.json();
};

const getTextSectionBySlug = (
  sections: TextSectionData[],
  slug: TextSectionData["slug"]
) => {
  const section = sections.find((item) => item.slug === slug);
  if (!section) {
    throw new Error(`Missing text section: ${slug}`);
  }
  return section;
};

export default async function HomeSectionPage() {
  const [
    exhibitorsData,
    curatedData,
    citizensHeaderData,
    heroData,
    homeTextSections,
    homeTextsData,
  ] = await Promise.all([
    fetchAboutParticipants(),
    fetchAboutCurated(),
    fetchAboutCitizensHeader(),
    fetchHomeHero(),
    fetchHomeTextSections(),
    fetchHomeTexts(),
  ]);

  return (
    <div className="space-y-10">
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Hero Section</h2>
        <HomeHeroAdminForm initialData={heroData} />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Home Texts</h2>
        <HomeTextsForm initialData={homeTextsData} />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Exhibitors Home Page Section</h2>
        <AboutParticipantsForm initialData={exhibitorsData} />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Become an Exhibitor</h2>
        <TextSectionAdminForm
          slug="become-an-exhibitor"
          sectionTitle="Become an Exhibitor"
          initialData={getTextSectionBySlug(
            homeTextSections,
            "become-an-exhibitor"
          )}
        />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Citizens of Honour Section</h2>
        <AboutCitizensHeaderForm initialData={citizensHeaderData} />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Alternatives from the Unexpected</h2>
        <TextSectionAdminForm
          slug="alternatives-unexpected"
          sectionTitle="Alternatives from the Unexpected"
          initialData={getTextSectionBySlug(
            homeTextSections,
            "alternatives-unexpected"
          )}
        />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Sticky Participants Section</h2>
        <AboutCuratedHeaderForm initialData={curatedData} />
      </section>
      <Separator />
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Newsletter</h2>
        <TextSectionAdminForm
          slug="newsletter"
          sectionTitle="Newsletter"
          initialData={getTextSectionBySlug(homeTextSections, "newsletter")}
        />
      </section>
    </div>
  );
}
