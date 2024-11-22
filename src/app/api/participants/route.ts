import { users } from "@/lib/mockMembers";
import { ParticipantUser } from "@/schemas/usersSchemas";
import { NextResponse } from "next/server";

export async function GET() {
  const filteredUsers = users.filter((user) => user.type === "participant");

  const response: ParticipantUser[] = filteredUsers;

  return NextResponse.json(response);
}
