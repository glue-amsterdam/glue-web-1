import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAdminAuth } from "@/lib/proxy/admin-auth";
import { refreshSession } from "@/lib/proxy/refresh-session";
import { handleUserAuth } from "@/lib/proxy/user-auth";
import {
  requiresAdminAuth,
  requiresUserAuth,
} from "@/lib/proxy/protected-routes";

const isScanApiPath = (pathname: string): boolean =>
  pathname === "/api/scan" || pathname.startsWith("/api/scan/");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (requiresAdminAuth(pathname)) {
    return handleAdminAuth(request);
  }

  if (requiresUserAuth(pathname, request.nextUrl.searchParams)) {
    return handleUserAuth(request);
  }

  if (isScanApiPath(pathname)) {
    const { response } = await refreshSession(request);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/map",
    "/program/:id",
    "/api/scan",
    "/api/scan/:path*",
  ],
};
