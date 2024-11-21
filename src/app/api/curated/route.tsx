import { users } from "@/lib/mockMembers";
import {
  CuratedParticipantWhitYear,
  ParticipantUser,
} from "@/schemas/usersSchemas";

import { NextResponse } from "next/server";

export async function GET() {
  const filteredUsers = users.filter((user) => user.type === "participant");
  const curatedUsers = filteredUsers.filter(
    (user): user is ParticipantUser & { year: number } =>
      user.isCurated && user.year !== undefined
  );

  const groupedByYear = curatedUsers.reduce<
    Record<number, CuratedParticipantWhitYear[]>
  >((acc, user) => {
    if (!acc[user.year]) {
      acc[user.year] = [];
    }
    acc[user.year].push({
      slug: user.slug,
      userName: user.userName,
      year: user.year,
    });
    return acc;
  }, {});

  return NextResponse.json(groupedByYear);
}
