"use client";

import { Suspense } from "react";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";
import { SignUpVisitorForm } from "@/components/sign-up/sign-up-visitor-form";

const pageTexts = {
  title: "Sign Up",
  description:
    "Create a visitor account with your email and password to access the GLUE platform.",
};

export default function SignUpPage() {
  return (
    <main id="sign-up-page" className="first-padding pb-[65px] md:pb-[105px]">
      <MainContainer>
        <section id="sign-up-section">
          <HeadlineWCross title={pageTexts.title} />
          <p className="sr-only">{pageTexts.description}</p>
          <Suspense fallback={null}>
            <SignUpVisitorForm />
          </Suspense>
        </section>
      </MainContainer>
    </main>
  );
}
