import { users } from "@/lib/mockMembers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ user_id: string }> }
) {
  const params = await props.params;
  if (!params || !params.user_id) {
    return NextResponse.json(
      { message: "Participant user_id is required" },
      { status: 400 }
    );
  }

  const { user_id } = params;

  const participants = users.filter((user) => user.type === "participant");

  const filteredUser = participants.filter((user) => user.user_id === user_id);

  if (filteredUser.length === 0) {
    return NextResponse.json(
      { message: "Participant by ID not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(filteredUser[0]);
}
