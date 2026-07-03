import type { Metadata } from "next";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import SanitizedHtmlGrid from "@/components/sanitized-html-grid";
import { contactMetadata } from "@/lib/metadata";
import { getCachedStaticPage } from "@/lib/static-pages/get-cached-static-page";
import { STATIC_PAGE_EMPTY_MESSAGE } from "@/lib/static-pages/static-pages-config";
import BottomBlock from "@/components/bottom-block";

export const dynamic = "force-static";

export const metadata: Metadata = contactMetadata;

export default async function ContactPage() {
  const { title, subtitle, content } = await getCachedStaticPage("contact");

  return (
    <main id="contact-page" className="terms-and-conditions-padding">
      <StaggerEnterContainer variant="enter">
        <h1 className="title-text uppercase">{title}</h1>
        <div className="title-padding max-w-[1044px] mx-auto min-h-[30dvh]">
          {subtitle ? (
            <p className="body-text pb-[40px] lg:pb-[60px]">{subtitle}</p>
          ) : null}
          <SanitizedHtmlGrid
            html={content || `<p>${STATIC_PAGE_EMPTY_MESSAGE.contact}</p>`}
            splitStrategy="delimiter"
            itemClassName="max-w-none"
          />
        </div>
        <BottomBlock />
      </StaggerEnterContainer>
    </main>
  );
}
