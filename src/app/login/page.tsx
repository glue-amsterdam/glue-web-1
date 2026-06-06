"use client";

import { Suspense } from "react";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import MainContainer from "@/components/main-container";
import PageLoginForm from "@/components/login/page-login-form";
import { buildSignUpBackHref, isFromSignUp, parseReturnToParam } from "@/lib/auth/post-auth-redirect";
import { useRouter, useSearchParams } from "next/navigation";

const pageTexts = {
  title: "Log In",
  description: "Sign in to your GLUE account with your email and password.",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = parseReturnToParam(searchParams);
  const handleBackToSignUp = () => {
    router.push(buildSignUpBackHref(returnTo));
  };
  const showSignUpBack = isFromSignUp(searchParams);
  return (
    <main id="login-page" className="first-padding pb-(--site-footer-h) min-h-dvh flex flex-col">
      <MainContainer className="flex-1 flex flex-col w-full">
        <section id="login-section" className="flex-1 flex flex-col">
          <Suspense fallback={null}>
            <AuthPageHeadline title={pageTexts.title} />
          </Suspense>
          {showSignUpBack ? (
            <button
              type="button"
              onClick={handleBackToSignUp}
              className="base-text-size cursor-pointer text-left pt-[15px] lg:pt-[30px]"
              aria-label="Back to sign up form"
            >
              Back
            </button>
          ) : null}
          <p className="sr-only">{pageTexts.description}</p>

          <Suspense fallback={null}>
            <PageLoginForm />
          </Suspense>

        </section>
      </MainContainer>
    </main>
  );
}
