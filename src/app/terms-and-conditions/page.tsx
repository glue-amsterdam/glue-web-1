import type { Metadata } from "next";
import MainContainer from "@/components/main-container";
import { TermsContent } from "@/components/terms-content";
import { termsAndConditionsMetadata } from "@/lib/metadata";
import { getCachedTerms } from "@/lib/terms/get-cached-terms";

export const revalidate = 3600;

export const metadata: Metadata = termsAndConditionsMetadata;

export default async function TermsAndConditionsPage() {
  const content = await getCachedTerms();

  return (
    <main
      id="terms-and-conditions-page"
      className="first-padding pb-[65px] md:pb-[105px]"
    >
      <MainContainer className="stagger-enter">
        <h1 className="title-text">General Terms and Conditions</h1>
        <div className="pt-[40px] lg:pt-[60px]">
          <TermsContent content={content} />
        </div>
      </MainContainer>
    </main>
  );
}
