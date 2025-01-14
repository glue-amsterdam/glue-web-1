import { BASE_URL } from "@/constants";

export interface ParticipantClient {
  slug: string;
  user_id: string;
  user_name: string;
  image_url: string | null;
}

interface ParticipantsApiResponse {
  participants: ParticipantClient[];
}

const mockParticipants: ParticipantClient[] = [
  {
    slug: "second-participant",
    user_id: "ce661ae2-e406-4cc4-b7b0-d8fe09e352ca",
    user_name: "Second participant",
    image_url: "/placeholder.jpg",
  },
  {
    slug: "participant-user-name",
    user_id: "3d6e3c54-bd10-42bd-b38b-bb1a30bdf8da",
    user_name: "Participant user Name",
    image_url: "/placeholder.jpg",
  },
  {
    slug: "mock-participant",
    user_id: "f80ec00c-5216-4677-a3fb-38a70d993870",
    user_name: "Mock participant 2",
    image_url: "/placeholder.jpg",
  },
];

export async function fetchParticipants(): Promise<ParticipantClient[]> {
  try {
    const response = await fetch(`${BASE_URL}/client-user`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getMockData();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ParticipantsApiResponse = await response.json();
    return data.participants;
  } catch (error) {
    console.error("Error fetching participants data", error);
    return mockParticipants;
  }
}

export function getMockData(): ParticipantClient[] {
  return mockParticipants;
}
