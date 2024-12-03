import { users } from "@/lib/mockMembers";
import {
  CuratedParticipantWhitYear,
  ParticipantUser,
} from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: curatedData } = await supabase
      .from("about_curated")
      .select("title,description")
      .single();

    if (!curatedData) {
      throw new Error("Failed to fetch curated about data in client api call");
    }

    const filteredUsers = users.filter((user) => user.type === "participant");

    const curatedUsers = filteredUsers.filter(
      (user): user is ParticipantUser & { year: number } =>
        user.isCurated && user.year !== undefined
    );

    const groupedByYear = curatedUsers.reduce<
      Record<string, CuratedParticipantWhitYear[]>
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

    return NextResponse.json({
      curatedParticipants: groupedByYear,
      headerData: curatedData,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch citizens section data" },
        { status: 500 }
      );
    }
  }
}
