import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Visitor email-only login is no longer supported. Sign in with your email and password.",
      code: "DEPRECATED",
    },
    { status: 410 }
  );
}
