import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildSignUpHref } from "@/lib/auth/post-auth-redirect";

const ADMIN_PUBLIC_PREFIXES = ["/admin/login"];

const PROGRAM_DETAIL_PATTERN = /^\/program\/[^/]+$/;

export const requiresAdminAuth = (pathname: string): boolean => {
  if (!pathname.startsWith("/admin")) {
    return false;
  }

  return !ADMIN_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

export const requiresUserAuth = (
  pathname: string,
  searchParams: URLSearchParams
): boolean => {
  if (pathname.startsWith("/dashboard")) {
    return true;
  }

  if (pathname === "/map" && searchParams.get("route")) {
    return true;
  }

  if (pathname === "/map" && searchParams.get("view") === "routes") {
    return true;
  }

  if (PROGRAM_DETAIL_PATTERN.test(pathname)) {
    return true;
  }

  return false;
};

export const buildSignUpRedirect = (request: NextRequest): NextResponse => {
  const { pathname, search } = request.nextUrl;
  const href = buildSignUpHref(pathname, search);
  return NextResponse.redirect(new URL(href, request.url));
};
