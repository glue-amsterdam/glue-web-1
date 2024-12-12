import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Admin authentication middleware logic
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = req.cookies.get("admin_token")?.value;

    // If there's no admin token, redirect to the admin login page
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // TODO: Implement admin token validation logic here
    // For now, we'll assume the token is valid if it exists
    return res;
  }

  // For all other routes, proceed as normal
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
