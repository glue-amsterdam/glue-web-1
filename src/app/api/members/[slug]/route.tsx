import { participants } from "@/lib/mockusers";
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

  const { slug } = params;

  const filteredEvents = participants.filter((member) => member.slug === slug);

  if (filteredEvents.length === 0) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(filteredEvents[0]);
}
