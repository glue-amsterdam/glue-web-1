import { users } from "@/lib/mockMembers";
import { EnhancedUser } from "@/schemas/eventSchemas";
import { NextResponse } from "next/server";

export async function GET() {
  const filteredUsers = users.filter((user) => user.type === "participant");

  const hubParticipants = filteredUsers.filter((p) => p.noAddress === true);

  if (!hubParticipants.length)
    return NextResponse.json(
      { message: "No hub participants found" },
      { status: 404 }
    );

  const response: EnhancedUser[] = hubParticipants.map((p) => ({
    userId: p.userId,
    userName: p.userName,
    slug: p.slug,
  }));

  return NextResponse.json(response);
}
