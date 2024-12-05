import { users } from "@/lib/mockMembers";
import { EnhancedUser } from "@/schemas/eventSchemas";
import { NextResponse } from "next/server";

export async function GET() {
  const filteredUsers = users.filter((user) => user.type === "participant");

  const hubParticipants = filteredUsers.filter((p) => p.no_address === true);

  if (!hubParticipants.length)
    return NextResponse.json(
      { message: "No hub participants found" },
      { status: 404 }
    );

  const response: EnhancedUser[] = hubParticipants.map((p) => ({
    user_id: p.user_id,
    user_name: p.user_name,
    slug: p.slug,
  }));

  return NextResponse.json(response);
}
