"use client";

import { Suspense } from "react";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import MainContainer from "@/components/main-container";
import PageLoginForm from "@/components/login/page-login-form";

const pageTexts = {
  title: "Log In",
  description: "Sign in to your GLUE account with your email and password.",
};

export default function LoginPage() {
  return (
    <main id="login-page" className="terms-and-conditions-padding pb-(--site-footer-h) min-h-dvh flex flex-col">
      <MainContainer className="flex-1 flex flex-col w-full">
        <StaggerEnterContainer
          as="section"
          variant="enter"
          id="login-section"
          className="flex-1 flex flex-col"
        >
          <Suspense fallback={null}>
            <AuthPageHeadline title={pageTexts.title} />
          </Suspense>
          <p className="sr-only">{pageTexts.description}</p>

          <Suspense fallback={null}>
            <PageLoginForm />
          </Suspense>

        </StaggerEnterContainer>
      </MainContainer>
    </main>
  );
}
