import { getHubParticipantsList } from "@/lib/hubs/get-hub-participants-list";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const participants = await getHubParticipantsList();
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error in GET /api/users/participants/hub:", error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch hub participants list" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
