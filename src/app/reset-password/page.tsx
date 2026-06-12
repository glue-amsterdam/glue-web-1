import ResetPasswordForm from "@/app/reset-password/reset-password-form";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import MainContainer from "@/components/main-container";
import { resetPasswordMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

const pageTexts = {
  title: "Reset Password",
  description:
    "Enter your email and choose a new password to complete the reset.",
};

export const metadata: Metadata = resetPasswordMetadata;

export default function ResetPasswordPage() {
  return (
    <main
      id="reset-password-page"
      className="first-padding pb-[65px] md:pb-[105px]"
    >
      <MainContainer>
        <section id="reset-password-section" className="stagger-enter">
          <Suspense fallback={null}>
            <AuthPageHeadline title={pageTexts.title} />
          </Suspense>
          <p className="pt-[40px] lg:pt-[60px] base-text-size max-w-(--paragraph-max-width)">
            {pageTexts.description}
          </p>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </section>
      </MainContainer>
    </main>
  );
}
