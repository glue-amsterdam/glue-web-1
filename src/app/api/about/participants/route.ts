import { users } from "@/lib/mockMembers";
import {
  ParticipantClient,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";
import { ParticipantUser, User } from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function isParticipantUser(user: User): user is ParticipantUser {
  return user.type === "participant" && "slug" in user;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: headerData, error: headerError } = await supabase
      .from("about_participants")
      .select("title,description")
      .single();

    if (headerError) {
      throw headerError;
    }

    // Filter and transform mock users
    const participants: ParticipantClient[] = users
      .filter(
        (user): user is ParticipantUser =>
          isParticipantUser(user) && user.status === "accepted"
      )
      .slice(0, 15)
      .map((user) => ({
        userId: user.userId,
        slug: user.slug,
        userName: user.userName,
        image: {
          image_url:
            user.images?.[0]?.image_url || "/placeholders/placeholder.jpg",
          alt: user.images?.[0]?.alt || `${user.userName} profile image`,
        },
      }));

    const response = {
      headerData,
      participants,
    };

    // Validate response with client schema
    const validatedResponse = participantsResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch participants section data" },
        { status: 500 }
      );
    }
  }
}
