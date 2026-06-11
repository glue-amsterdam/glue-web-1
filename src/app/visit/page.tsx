import BottomBlock from "@/components/bottom-block";
import CmsTextSection from "@/components/cms/cms-text-section";
import CmsIntroSection from "@/components/cms/cms-intro-section";
import MainContainer from "@/components/main-container";
import Separator from "@/components/separator";
import { visitMetadata } from "@/lib/metadata";
import { TEXT_SECTION_REVALIDATE_SECONDS } from "@/lib/text-sections/types";
import type { Metadata } from "next";

export const metadata: Metadata = visitMetadata;

export const revalidate = TEXT_SECTION_REVALIDATE_SECONDS;

const Page = () => {
  return (
    <main id="visit-page">
      <MainContainer className="cta-padding">
        <CmsIntroSection slug="visit-intro" />
        <Separator />
        <CmsTextSection slug="visit-sign-up" />
        <Separator />
        <CmsTextSection slug="alternatives-unexpected" />
        <Separator />
        <CmsTextSection slug="visit-discover" />
        <Separator />
        <CmsTextSection slug="newsletter" />
        <BottomBlock />
      </MainContainer>
    </main>
  );
};

export default Page;
