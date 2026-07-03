import type { Metadata } from "next";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import SanitizedHtmlGrid from "@/components/sanitized-html-grid";
import { termsAndConditionsMetadata } from "@/lib/metadata";
import { getCachedTerms } from "@/lib/terms/get-cached-terms";
import BottomBlock from "@/components/bottom-block";
import { CookieBanner } from "@/components/cookies/cookies-banner";

export const dynamic = "force-static";

export const metadata: Metadata = termsAndConditionsMetadata;

export default async function TermsAndConditionsPage() {
  const { title, subtitle, content } = await getCachedTerms();

  return (
    <main
      id="terms-and-conditions-page"
      className="terms-and-conditions-padding"
    >
      <StaggerEnterContainer variant="enter">
        <h1 className="title-text uppercase">{title}</h1>
        <div className="title-padding max-w-[1044px] mx-auto">
          <p className="body-text pb-[40px] lg:pb-[60px]">{subtitle}</p>
          <SanitizedHtmlGrid
            html={content || "<p>No terms and conditions available.</p>"}
            splitStrategy="delimiter"
            itemClassName="max-w-none"
          />
        </div>

        <div className="title-padding">
          <CookieBanner variant="inline" /></div>

        <BottomBlock />
      </StaggerEnterContainer>
    </main>
  );
}
