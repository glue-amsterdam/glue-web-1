import { config } from "@/config";
import { aboutPageMetadata } from "@/lib/metadata";
import { loadAboutPageData } from "@/lib/about/load-about-page-data";
import { getCachedMainLinks } from "@/lib/main/get-main-links";
import { getOrganizationSameAs } from "@/lib/seo/organization-same-as";
import { stripHtmlTags } from "@/lib/sanitize-html";
import AboutPageView from "@/components/about/blocks/about-page-view";
import type { LinkItem } from "@/schemas/mainSchema";
import type { Metadata } from "next";
import {
  ABOUT_BLOCK_IDS,
  type FaqBlock,
  type TeamBlock,
} from "@/schemas/aboutPageSchema";

export const dynamic = "force-static";

export const metadata: Metadata = aboutPageMetadata;

const buildAboutStructuredData = (
  teamBlock: TeamBlock | undefined,
  faqBlock: FaqBlock | undefined,
  mainLinks: LinkItem[]
) => {
  const sameAs = getOrganizationSameAs(mainLinks);

  const organization = {
    "@type": "Organization",
    name: `GLUE ${config.cityName}`,
    url: config.baseUrl,
    logo: `${config.baseUrl}/${config.cityName}/og-image.jpg`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    employee: (teamBlock?.members ?? []).map((member) => ({
      "@type": "Person",
      name: member.name,
      jobTitle: member.role,
      email: member.email,
      telephone: member.phone,
    })),
  };

  const aboutPage = {
    "@type": "AboutPage",
    name: `About GLUE ${config.cityName}`,
    url: `${config.baseUrl}/about`,
    mainEntity: organization,
  };

  const faqPage =
    faqBlock?.is_visible && faqBlock.items.length > 0
      ? {
        "@type": "FAQPage",
        mainEntity: faqBlock.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripHtmlTags(item.answer),
          },
        })),
      }
      : null;

  return {
    "@context": "https://schema.org",
    "@graph": [aboutPage, organization, ...(faqPage ? [faqPage] : [])],
  };
};

export default async function AboutPage() {
  const [data, mainLinks] = await Promise.all([
    loadAboutPageData(),
    getCachedMainLinks(),
  ]);

  const teamBlock = data.blocks.find(
    (block) => block.id === ABOUT_BLOCK_IDS.TEAM
  ) as TeamBlock | undefined;
  const faqBlock = data.blocks.find(
    (block) => block.id === ABOUT_BLOCK_IDS.FAQ
  ) as FaqBlock | undefined;

  const structuredData = buildAboutStructuredData(teamBlock, faqBlock, mainLinks);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutPageView data={data} />
    </>
  );
}
