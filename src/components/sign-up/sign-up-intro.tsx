"use client";

import { useSearchParams } from "next/navigation";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import { parseSignupSourceParam } from "@/lib/auth/post-auth-redirect";

type SignUpIntroContent = {
  title: string;
  description: string;
};

type SignUpIntroProps = {
  restricted: SignUpIntroContent;
  visitor: SignUpIntroContent;
};

export const SignUpIntro = ({ restricted, visitor }: SignUpIntroProps) => {
  const searchParams = useSearchParams();
  const signupSource = parseSignupSourceParam(searchParams);
  const content = signupSource === "restricted" ? restricted : visitor;

  return (
    <>
      <AuthPageHeadline title={content.title} />
      <p className="title-padding body-text max-w-(--paragraph-max-width)">
        {content.description}
      </p>
    </>
  );
};
