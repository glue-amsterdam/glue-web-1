import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Email verification links for visitors are deprecated. Use account registration with password.",
      code: "DEPRECATED",
    },
    { status: 410 }
  );
}
