import { NextRequest, NextResponse } from "next/server";

import { users } from "@/lib/mockMembers";
import { EnhancedUser } from "@/schemas/eventSchemas";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get("term");

  if (!term) {
    return NextResponse.json(
      { error: "Search term is required" },
      { status: 400 }
    );
  }

  const participants = users.filter((user) => user.type === "participant");

  // Convert the search term to lowercase for case-insensitive matching
  const lowercaseTerm = term.toLowerCase();

  // Filter users based on the search term
  const filteredUsers = participants.filter(
    (user) =>
      user.userName.toLowerCase().includes(lowercaseTerm) ||
      user.slug.toLowerCase().includes(lowercaseTerm) ||
      user.userId.toLowerCase().includes(lowercaseTerm)
  );

  const response: EnhancedUser[] = filteredUsers.map((user) => {
    return {
      userId: user.userId,
      userName: user.userName,
      slug: user.slug,
    };
  });

  // In a real-world scenario, you might want to limit the number of results
  const limitedResponse = response.slice(0, 10);

  return NextResponse.json(limitedResponse);
}
