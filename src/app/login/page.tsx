"use client";

import { Suspense } from "react";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";
import PageLoginForm from "@/components/login/page-login-form";

const pageTexts = {
  title: "Log In",
  description: "Sign in to your GLUE account with your email and password.",
};

export default function LoginPage() {
  return (
    <main id="login-page" className="first-padding pb-(--site-footer-h) min-h-dvh flex flex-col">
      <MainContainer className="flex-1 flex flex-col w-full">
        <section id="login-section" className="flex-1 flex flex-col">
          <HeadlineWCross title={pageTexts.title} />
          <p className="sr-only">{pageTexts.description}</p>
          <div className="flex-1 flex items-center w-full">
            <Suspense fallback={null}>
              <PageLoginForm />
            </Suspense>
          </div>
        </section>
      </MainContainer>
    </main>
  );
}
