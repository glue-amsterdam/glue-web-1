import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { config } from "@/config";

export type RefreshedSession = {
  response: NextResponse;
  user: { id: string } | null;
};

/**
 * Refreshes Supabase auth cookies on the response without redirecting.
 * Safe for API routes that must return JSON 401 instead of an HTML signup page.
 */
export const refreshSession = async (
  request: NextRequest,
): Promise<RefreshedSession> => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    response: supabaseResponse,
    user: user ? { id: user.id } : null,
  };
};
