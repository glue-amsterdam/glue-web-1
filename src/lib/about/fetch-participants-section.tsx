import { BASE_URL } from "@/constants";
import { ParticipantsResponse } from "@/schemas/participantsSchema";

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
      },
    },
    {
      userId: "placeholder-2",
      slug: "placeholder-participant-2",
      userName: "Loading Participant 2",
      image: {
        image_url: "/placeholder.jgp",
      },
    },
    {
      userId: "placeholder-3",
      slug: "placeholder-participant-3",
      userName: "Loading Participant 3",
      image: {
        image_url: "/placeholder.jgp",
      },
    },
  ],
};

export async function fetchAboutParticipants(): Promise<ParticipantsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/about/participants`, {
      next: {
        revalidate: 30,
        tags: ["participants"],
      },
    });

    if (!res.ok) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getMockData();
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching participants data:", error);
    return PARTICIPANT_FALLBACK_DATA;
  }
}

export function getMockData(): ParticipantsResponse {
  return PARTICIPANT_FALLBACK_DATA;
}
