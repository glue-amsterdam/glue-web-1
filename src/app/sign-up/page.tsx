import { Suspense } from "react";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import MainContainer from "@/components/main-container";
import { SignUpVisitorForm } from "@/components/sign-up/sign-up-visitor-form";
import { parseSignupSourceParam } from "@/lib/auth/post-auth-redirect";
import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import { resolveSignUpIntroSlug } from "@/lib/text-sections/resolve-sign-up-intro-slug";
import { signUpMetadata } from "@/lib/metadata";
import { fetchVisitorAreas } from "@/lib/visitors/fetch-visitor-areas";
import type { Metadata } from "next";

export const metadata: Metadata = signUpMetadata;

export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<{ signupSource?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const signupSource = parseSignupSourceParam(
    new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      )
    )
  );
  const introSlug = resolveSignUpIntroSlug(signupSource);

  const [signUpIntro, workAreas] = await Promise.all([
    getCachedTextSection(introSlug),
    fetchVisitorAreas(),
  ]);

  return (
    <main id="sign-up-page" className="terms-and-conditions-padding pb-(--site-footer-h) min-h-dvh">
      <MainContainer>
        <StaggerEnterContainer as="section" variant="enter" id="sign-up-section">
          <Suspense fallback={null}>
            <AuthPageHeadline title={signUpIntro.title} />
          </Suspense>
          <p className="title-padding body-text max-w-(--paragraph-max-width)">
            {signUpIntro.description}
          </p>
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
