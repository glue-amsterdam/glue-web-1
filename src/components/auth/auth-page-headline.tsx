"use client";

import { useSearchParams } from "next/navigation";
import HeadlineWCross from "@/components/headline-w-cross";
import {
  buildAnonymousCloseHref,
  parseCancelToParam,
  parseReturnToParam,
  resolveCancelTo,
} from "@/lib/auth/post-auth-redirect";

type AuthPageHeadlineProps = {
  title: string;
};

export const AuthPageHeadline = ({ title }: AuthPageHeadlineProps) => {
  const searchParams = useSearchParams();
  const returnTo = parseReturnToParam(searchParams);
  const cancelTo = resolveCancelTo(parseCancelToParam(searchParams));

  return (
    <HeadlineWCross
      title={title}
      closeFallbackHref={buildAnonymousCloseHref(returnTo, cancelTo)}
    />
  );
};
