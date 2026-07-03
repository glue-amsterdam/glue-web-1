import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  buildSignUpHref,
  captureCancelPathFromReferer,
  captureReturnPath,
} from "@/lib/auth/post-auth-redirect";
import { requiresUserAuth } from "@/lib/auth/protected-routes";

export { requiresUserAuth } from "@/lib/auth/protected-routes";

const ADMIN_PUBLIC_PREFIXES = ["/admin/login"];

export const requiresAdminAuth = (pathname: string): boolean => {
  if (!pathname.startsWith("/admin")) {
    return false;
  }

  return !ADMIN_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

export const buildSignUpRedirect = (request: NextRequest): NextResponse => {
  const { pathname, search } = request.nextUrl;
  const returnPath = captureReturnPath(pathname, search);
  const cancelTo = captureCancelPathFromReferer(
    request.headers.get("referer"),
    request.nextUrl.origin,
    returnPath,
  );
  const href = buildSignUpHref(pathname, search, cancelTo);
  return NextResponse.redirect(new URL(href, request.url));
};
