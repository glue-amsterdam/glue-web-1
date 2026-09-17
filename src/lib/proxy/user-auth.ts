import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { buildSignUpRedirect } from "@/lib/proxy/protected-routes";
import { refreshSession } from "@/lib/proxy/refresh-session";

export const handleUserAuth = async (
  request: NextRequest,
): Promise<NextResponse> => {
  const { response, user } = await refreshSession(request);

  if (!user) {
    return buildSignUpRedirect(request);
  }

  return response;
};
