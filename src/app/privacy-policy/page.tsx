import type { Metadata } from "next";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import SanitizedHtmlGrid from "@/components/sanitized-html-grid";
import { privacyPolicyMetadata } from "@/lib/metadata";
import { getCachedStaticPage } from "@/lib/static-pages/get-cached-static-page";
import { STATIC_PAGE_EMPTY_MESSAGE } from "@/lib/static-pages/static-pages-config";
import BottomBlock from "@/components/bottom-block";

export const dynamic = "force-static";

export const metadata: Metadata = privacyPolicyMetadata;

export default async function PrivacyPolicyPage() {
  const { title, subtitle, content } =
    await getCachedStaticPage("privacy-policy");

  return (
    <main id="privacy-policy-page" className="terms-and-conditions-padding">
      <StaggerEnterContainer variant="enter">
        <h1 className="title-text uppercase">{title}</h1>
        <div className="title-padding max-w-[1044px] mx-auto">
          {subtitle ? (
            <p className="body-text">{subtitle}</p>
          ) : null}
          <SanitizedHtmlGrid
            html={
              content || `<p>${STATIC_PAGE_EMPTY_MESSAGE["privacy-policy"]}</p>`
            }
            className="title-padding"
            splitStrategy="delimiter"
            itemClassName="max-w-none"
          />
        </div>
        <BottomBlock />
      </StaggerEnterContainer>    </main>
  );
}
