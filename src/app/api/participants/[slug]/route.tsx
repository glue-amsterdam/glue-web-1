import { users } from "@/lib/mockMembers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  if (!params || !params.slug) {
    return NextResponse.json(
      { message: "Member SLUG is required" },
      { status: 400 }
    );
  }

  const { slug } = await params;

  const participants = users.filter((user) => user.type === "participant");

  const filteredUser = participants.filter((user) => user.slug === slug);

  if (filteredUser.length === 0) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(filteredUser[0]);
}
