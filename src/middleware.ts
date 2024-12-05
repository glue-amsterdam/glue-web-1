import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const pathname = request.nextUrl.pathname;

  // Check session with Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Admin authentication middleware logic
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_token")?.value;

    // If there's no admin token, redirect to the admin login page
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // If the token exists and is valid, allow the request to proceed
    return res;
  }

  // Supabase auth for protected routes
  if (!session && pathname.startsWith("/dashboard")) {
    // Set a cookie to indicate that login is required
    res.cookies.set("login_required", "true", {
      httpOnly: false,
      sameSite: "strict",
      maxAge: 60, // Cookie expires in 1 minute
    });
  }

  // For all other routes, proceed as normal
  return res;
}

// Update the matcher to include both the dashboard and admin routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
