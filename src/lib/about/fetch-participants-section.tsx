import { BASE_URL } from "@/constants";
import {
  ParticipantsResponse,
  participantsResponseSchema,
} from "@/schemas/participantsSchema";

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
        image_url: "/placeholder.jgp",
        alt: "Loading participant 1",
      },
    },
    {
      userId: "placeholder-2",
      slug: "placeholder-participant-2",
      userName: "Loading Participant 2",
      image: {
        image_url: "/placeholder.jgp",
        alt: "Loading participant 2",
      },
    },
    {
      userId: "placeholder-3",
      slug: "placeholder-participant-3",
      userName: "Loading Participant 3",
      image: {
        image_url: "/placeholder.jgp",
        alt: "Loading participant 3",
      },
    },
  ],
};

export async function fetchAboutParticipants(): Promise<ParticipantsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/participants`, {
      next: {
        revalidate: 3600,
        tags: ["participants"],
      },
    });

    if (!res.ok) {
      if (res.status === 404 || process.env.NODE_ENV === "development") {
        console.warn("Using fallback data for participants section");
        return PARTICIPANT_FALLBACK_DATA;
      }
      throw new Error(
        `Failed to fetch participants section data: ${res.statusText}`
      );
    }

    const data = await res.json();
    const validatedData = participantsResponseSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error fetching participants data:", error);
    return PARTICIPANT_FALLBACK_DATA;
  }
}
