import { Suspense } from "react";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import MainContainer from "@/components/main-container";
import { AccountWizard } from "@/components/account/account-wizard";
import { accountMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = accountMetadata;

export default function AccountPage() {
  return (
    <main id="account-page" className="terms-and-conditions-padding pb-(--site-footer-h) min-h-dvh flex flex-col">
      <MainContainer className="flex-1 flex flex-col w-full">
        <StaggerEnterContainer
          as="section"
          variant="enter"
          id="account-section"
          className="flex-1 flex flex-col"
        >
          <Suspense fallback={null}>
            <AccountWizard />
          </Suspense>
        </StaggerEnterContainer>
      </MainContainer>
    </main>
  );
}
