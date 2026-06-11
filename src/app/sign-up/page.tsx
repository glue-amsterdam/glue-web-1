import { Suspense } from "react";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import MainContainer from "@/components/main-container";
import { SignUpVisitorForm } from "@/components/sign-up/sign-up-visitor-form";
import { signUpMetadata } from "@/lib/metadata";
import { getCachedTerms } from "@/lib/terms/get-cached-terms";
import type { Metadata } from "next";

export const metadata: Metadata = signUpMetadata;

export const revalidate = 3600;

const pageTexts = {
  title: "Sign Up",
  description:
    "You must register to access this information. Registering does not commit you to anything. GLUE is free, so there is no charge. ",
};

export default async function SignUpPage() {
  const termsContent = await getCachedTerms();

  return (
    <main id="sign-up-page" className="first-padding pb-[65px] md:pb-[105px]">
      <MainContainer>
        <section id="sign-up-section">
          <Suspense fallback={null}>
            <AuthPageHeadline title={pageTexts.title} />
          </Suspense>
          <p className="pt-[40px] lg:pt-[60px] base-text-size max-w-(--paragraph-max-width)">
            {pageTexts.description}
          </p>
          <Suspense fallback={null}>
            <SignUpVisitorForm termsContent={termsContent} />
          </Suspense>
        </section>
      </MainContainer>
    </main>
  );
}
