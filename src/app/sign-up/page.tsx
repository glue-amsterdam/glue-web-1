import { Suspense } from "react";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import MainContainer from "@/components/main-container";
import { SignUpIntro } from "@/components/sign-up/sign-up-intro";
import { SignUpVisitorForm } from "@/components/sign-up/sign-up-visitor-form";
import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import { signUpMetadata } from "@/lib/metadata";
import { fetchVisitorAreas } from "@/lib/visitors/fetch-visitor-areas";
import type { Metadata } from "next";

export const metadata: Metadata = signUpMetadata;

export const revalidate = 3600;

export default async function SignUpPage() {
  const [restrictedIntro, visitorIntro, workAreas] = await Promise.all([
    getCachedTextSection("sign-up-intro-restricted"),
    getCachedTextSection("sign-up-intro-visitor"),
    fetchVisitorAreas(),
  ]);

  return (
    <main
      id="sign-up-page"
      className="terms-and-conditions-padding pb-(--site-footer-h) min-h-dvh"
    >
      <MainContainer>
        <StaggerEnterContainer
          as="section"
          variant="enter"
          id="sign-up-section"
        >
          <Suspense fallback={null}>
            <SignUpIntro restricted={restrictedIntro} visitor={visitorIntro} />
          </Suspense>
          <Suspense fallback={null}>
            <SignUpVisitorForm
              workAreas={workAreas.map(({ id, name }) => ({ id, name }))}
            />
          </Suspense>
        </StaggerEnterContainer>
      </MainContainer>
    </main>
  );
}
