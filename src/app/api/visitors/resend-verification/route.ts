import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Resend verification is deprecated. Register or sign in with password.",
      code: "DEPRECATED",
    },
    { status: 410 }
  );
}
