import { users } from "@/lib/mockMembers";
import { CuratedResponse } from "@/schemas/curatedSchema";
import {
  CuratedParticipantWhitYear,
  ParticipantUser,
} from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const CURATED_FALLBACK_DATA: CuratedResponse = {
  headerData: {
    title: "GLUE STICKY MEMBER",
    description:
      "Discover the GLUE STICKY MEMBER, a curated group of designers, architects, and creatives who have made a significant impact on the industry.",
  },
  curatedParticipants: {
    "2024": [
      {
        slug: "placeholder-1",
        userName: "Loading Member 1",
        year: 2024,
      },
      {
        slug: "placeholder-2",
        userName: "Loading Member 2",
        year: 2024,
      },
    ],
  },
};

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for curated section during build");
      return NextResponse.json(CURATED_FALLBACK_DATA);
    }

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
    } else {
      console.warn("Using fallback data for citizens");
      return NextResponse.json(CURATED_FALLBACK_DATA);
    }
  }
}
