import { Suspense } from "react";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import MainContainer from "@/components/main-container";
import { SignUpVisitorForm } from "@/components/sign-up/sign-up-visitor-form";
import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import { signUpMetadata } from "@/lib/metadata";
import { fetchVisitorAreas } from "@/lib/visitors/fetch-visitor-areas";
import type { Metadata } from "next";

export const metadata: Metadata = signUpMetadata;

export const revalidate = 3600;

export default async function SignUpPage() {
  const [signUpIntro, workAreas] = await Promise.all([
    getCachedTextSection("sign-up-intro"),
    fetchVisitorAreas(),
  ]);

  return (
    <main id="sign-up-page" className="first-padding pb-[65px] md:pb-[105px]">
      <MainContainer>
        <section id="sign-up-section">
          <Suspense fallback={null}>
            <AuthPageHeadline title={signUpIntro.title} />
          </Suspense>
          <p className="pt-[40px] lg:pt-[60px] base-text-size max-w-(--paragraph-max-width)">
            {signUpIntro.description}
          </p>
          <Suspense fallback={null}>
            <SignUpVisitorForm
              workAreas={workAreas.map(({ id, name }) => ({ id, name }))}
            />
          </Suspense>
        </section>
      </MainContainer>
    </main>
  );
}
