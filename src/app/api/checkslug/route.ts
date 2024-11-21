import { users } from "@/lib/mockMembers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { message: "Valid slug is required" },
      { status: 400 }
    );
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json(
      { message: "Invalid slug format" },
      { status: 400 }
    );
  }

  const participants = users.filter((user) => user.type === "participant");

  const isUnique = !participants.some(
    (participant) => participant.slug === slug
  );

  return NextResponse.json({ isUnique });
}
