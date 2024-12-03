import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Existing user middleware logic
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // New admin authentication middleware logic
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_token")?.value;

    // If there's no admin token, redirect to the login page
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Here you could add additional checks, like verifying the token
    // For example, you might want to decode a JWT and check its expiration

    // If the token exists and is valid, allow the request to proceed
    return NextResponse.next();
  }

  // For all other routes, proceed as normal
  return NextResponse.next();
}

// Update the matcher to include both the dashboard and admin routes
export const config = {
  matcher: ["/dashboard", "/admin/:path*"],
};
