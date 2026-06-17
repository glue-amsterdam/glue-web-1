import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const handleAdminAuth = (request: NextRequest): NextResponse => {
  const adminToken = request.cookies.get("admin_token");

  if (!adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
};
