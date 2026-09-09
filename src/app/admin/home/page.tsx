import { getAdminSupabaseOrRedirect } from "@/lib/admin/get-admin-supabase";
import { fetchAboutParticipantsSection } from "@/lib/about/fetch-about-admin";
import { fetchHomeHero } from "@/lib/home/fetch-home-hero";
import { fetchHomeStickyCta } from "@/lib/home/fetch-home-sticky-cta";
import { fetchHomeTexts } from "@/lib/main/fetch-home-text-admin";
import { fetchTextSectionsByGroup } from "@/lib/text-sections/fetch-text-sections-by-group";
import { createClient } from "@/utils/supabase/server";

import AboutParticipantsForm from "@/components/admin/about/participants/AboutParticipantsForm";
import HomeHeroAdminForm from "@/components/admin/about/home/home-hero-admin-form";
import HomeStickyCtaAdminForm from "@/components/admin/home/home-sticky-cta-admin-form";
import HomeTextsForm from "@/components/admin/home/home-texts-form";
import TextSectionAdminForm from "@/components/admin/text-sections/text-section-admin-form";
import type { TextSectionData } from "@/lib/text-sections/types";
import type { HomeHero } from "@/schemas/homeHeroSchema";
import type { HomeStickyCta } from "@/schemas/homeStickyCtaSchema";

const mapHeroDataToForm = (hero: {
  id: string | null;
  description: string;
  videoUrl: string;
  posterUrl: string;
}): HomeHero => ({
  id: hero.id ?? undefined,
  description: hero.description,
  video_url: hero.videoUrl,
  poster_url: hero.posterUrl,
});

const mapStickyCtaDataToForm = (cta: {
  id: string | null;
  buttonLabel: string;
  buttonLink: string;
}): HomeStickyCta => ({
  id: cta.id ?? undefined,
  button_label: cta.buttonLabel,
  button_link: cta.buttonLink,
});

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
  await getAdminSupabaseOrRedirect();
  const supabase = await createClient();

  const [
    exhibitorsData,
    heroData,
    stickyCtaData,
    homeTextSections,
    homeTextsData,
  ] = await Promise.all([
    fetchAboutParticipantsSection(supabase),
    fetchHomeHero(supabase),
    fetchHomeStickyCta(supabase),
    fetchTextSectionsByGroup(supabase, "home"),
    fetchHomeTexts(supabase),
  ]);

  return (
    <div className="space-y-10">
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Hero Section</h2>
        <HomeHeroAdminForm initialData={mapHeroDataToForm(heroData)} />
      </section>
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Home Texts</h2>
        <HomeTextsForm initialData={homeTextsData} />
      </section>
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Exhibitors Home Page Section</h2>
        <AboutParticipantsForm initialData={exhibitorsData} />
      </section>
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Sticky participants button</h2>
        <HomeStickyCtaAdminForm
          initialData={mapStickyCtaDataToForm(stickyCtaData)}
        />
      </section>
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
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Newsletter</h2>
        <TextSectionAdminForm
          slug="newsletter"
          sectionTitle="Newsletter"
          initialData={getTextSectionBySlug(homeTextSections, "newsletter")}
        />
      </section>
      <section className="border-t pt-8">
        <h2 className="title-text mb-4">Posts</h2>
        <TextSectionAdminForm
          slug="home-posts"
          sectionTitle="Blog"
          initialData={getTextSectionBySlug(homeTextSections, "home-posts")}
        />
      </section>
    </div>
  );
}
