import { getParticipantEventsSummary } from "@/lib/events/get-participant-events-summary";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const events = await getParticipantEventsSummary(userId);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
