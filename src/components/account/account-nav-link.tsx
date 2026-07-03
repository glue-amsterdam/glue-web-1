"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { buildAccountHref } from "@/lib/auth/post-auth-redirect";

type AccountNavLinkProps = Omit<ComponentProps<typeof Link>, "href">;

export const AccountNavLink = ({ children, ...props }: AccountNavLinkProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const href = buildAccountHref(pathname, searchParams.toString());

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};

export const useAccountHref = (): string => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return buildAccountHref(pathname, searchParams.toString());
};
