import { requirePlatformMod } from "@/lib/permissions/require-platform-mod";
import { NextResponse } from "next/server";

export const guardMapInfoWrite = async (): Promise<NextResponse | null> => {
  const modCheck = await requirePlatformMod();
  if (!modCheck.ok) {
    return modCheck.response;
  }

  return null;
};
