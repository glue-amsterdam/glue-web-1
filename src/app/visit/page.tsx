import BottomBlock from "@/components/bottom-block";
import CmsTextSection from "@/components/cms/cms-text-section";
import CmsIntroSection from "@/components/cms/cms-intro-section";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import Separator from "@/components/separator";
import { visitMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = visitMetadata;

/** Must match TEXT_SECTION_REVALIDATE_SECONDS (segment config requires a literal). */
export const revalidate = 5_184_000;

const Page = () => {
  return (
    <main id="visit-page">
      <StaggerEnterContainer variant="enter" className="cta-padding">
        <CmsIntroSection slug="visit-intro" />
        <Separator />
        <CmsTextSection slug="visit-sign-up" />
        <Separator />
        <CmsTextSection slug="alternatives-unexpected" />
        <Separator />
        <CmsTextSection slug="visit-discover" bodyClassName="body-text" />
        <Separator />
        <CmsTextSection slug="newsletter" />
        <BottomBlock />
      </StaggerEnterContainer>
    </main>
  );
};

export default Page;
