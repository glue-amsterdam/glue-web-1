import { users } from "@/lib/mockMembers";
import {
  ParticipantClient,
  ParticipantsResponse,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";
import { ParticipantUser, User } from "@/schemas/usersSchemas";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const PARTICIPANT_FALLBACK_DATA: ParticipantsResponse = {
  headerData: {
    title: "Participants Section!",
    description:
      "Discover all participating brands, designers, studio's and academies of GLUE amsterdam connected by design",
  },
  participants: [
    {
      userId: "placeholder-1",
      slug: "placeholder-participant-1",
      userName: "Loading Participant 1",
      image: {
        image_url: "/placeholder.svg?height=300&width=300",
        alt: "Loading participant 1",
      },
    },
    {
      userId: "placeholder-2",
      slug: "placeholder-participant-2",
      userName: "Loading Participant 2",
      image: {
        image_url: "/placeholder.svg?height=300&width=300",
        alt: "Loading participant 2",
      },
    },
    {
      userId: "placeholder-3",
      slug: "placeholder-participant-3",
      userName: "Loading Participant 3",
      image: {
        image_url: "/placeholder.svg?height=300&width=300",
        alt: "Loading participant 3",
      },
    },
  ],
};

function isParticipantUser(user: User): user is ParticipantUser {
  return user.type === "participant" && "slug" in user;
}

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for participants section during build");
      return NextResponse.json(PARTICIPANT_FALLBACK_DATA);
    }
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
    } else {
      console.warn("Using fallback data for citizens");
      return NextResponse.json(PARTICIPANT_FALLBACK_DATA);
    }
  }
}
