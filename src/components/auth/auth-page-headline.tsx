"use client";

import { useSearchParams } from "next/navigation";
import HeadlineWCross from "@/components/headline-w-cross";
import {
  buildAnonymousFallback,
  parseReturnToParam,
} from "@/lib/auth/post-auth-redirect";

type AuthPageHeadlineProps = {
  title: string;
};

export const AuthPageHeadline = ({ title }: AuthPageHeadlineProps) => {
  const searchParams = useSearchParams();
  const returnTo = parseReturnToParam(searchParams);

  return (
    <HeadlineWCross
      title={title}
      closeFallbackHref={buildAnonymousFallback(returnTo)}
      preferCloseFallback={Boolean(returnTo)}
    />
  );
};
