"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { buildSignUpHref } from "@/lib/auth/post-auth-redirect";

type SignUpNavLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export const SignUpNavLink = ({ children, ...props }: SignUpNavLinkProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = buildSignUpHref(pathname, searchParams.toString());

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export const useSignUpHref = (): string => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return buildSignUpHref(pathname, searchParams.toString());
};
