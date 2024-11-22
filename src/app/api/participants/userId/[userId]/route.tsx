import { users } from "@/lib/mockMembers";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  if (!params || !params.userId) {
    return NextResponse.json(
      { message: "Participant userId is required" },
      { status: 400 }
    );
  }

  const { userId } = params;

  const participants = users.filter((user) => user.type === "participant");

  const filteredUser = participants.filter((user) => user.userId === userId);

  if (filteredUser.length === 0) {
    return NextResponse.json(
      { message: "Participant by ID not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(filteredUser[0]);
}
