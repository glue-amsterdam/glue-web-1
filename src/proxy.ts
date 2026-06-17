import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAdminAuth } from "@/lib/proxy/admin-auth";
import { handleUserAuth } from "@/lib/proxy/user-auth";
import {
  requiresAdminAuth,
  requiresUserAuth,
} from "@/lib/proxy/protected-routes";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (requiresAdminAuth(pathname)) {
    return handleAdminAuth(request);
  }

  if (requiresUserAuth(pathname, request.nextUrl.searchParams)) {
    return handleUserAuth(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/map",
    "/program/:path*",
  ],
};
