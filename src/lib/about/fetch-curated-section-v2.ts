import { BASE_URL } from "@/constants";

export interface CuratedV2Participant {
  userId: string;
  slug: string;
  userName: string;
  image: { image_url: string; alt: string };
}

export interface CuratedV2Group {
  year: number;
  group_photo_url: string | null;
  participants: CuratedV2Participant[];
}

export interface CuratedV2Response {
  headerData: {
    title: string;
    description: string;
    is_visible: boolean;
    text_color: string;
    background_color: string;
  };
  curatedGroups: Record<number, CuratedV2Group>;
}

interface APIGroupParticipant {
  user_id: string;
  slug: string;
  name: string;
  image_url: string;
  is_curated: boolean;
}

const FALLBACK_HEADER_DATA = {
  title: "GLUE STICKY MEMBER",
  description:
    "Discover the GLUE STICKY MEMBER, a curated group of designers, architects, and creatives who have made a significant impact on the industry.",
  is_visible: true,
  text_color: "#ffffff",
  background_color: "#000000",
};

export async function fetchCuratedSectionV2(): Promise<CuratedV2Response> {
  try {
    // 1. Fetch header data
    const headerRes = await fetch(`${BASE_URL}/about/sticky-groups`, {
      next: {
        revalidate: 172800,
        tags: ["sticky-groups"],
      },
    });

    let headerData = FALLBACK_HEADER_DATA;
    if (headerRes.ok) {
      const headerDataFromAPI = await headerRes.json();
      headerData = {
        title: headerDataFromAPI.title || FALLBACK_HEADER_DATA.title,
        description:
          headerDataFromAPI.description || FALLBACK_HEADER_DATA.description,
        is_visible:
          headerDataFromAPI.is_visible ?? FALLBACK_HEADER_DATA.is_visible,
        text_color:
          headerDataFromAPI.text_color || FALLBACK_HEADER_DATA.text_color,
        background_color:
          headerDataFromAPI.background_color ||
          FALLBACK_HEADER_DATA.background_color,
      };
    }

    // 2. Fetch years
    const yearsRes = await fetch(`${BASE_URL}/admin/sticky-groups/years`, {
      next: {
        revalidate: 172800,
        tags: ["sticky-groups"],
      },
    });
    const years: number[] = yearsRes.ok ? await yearsRes.json() : [];

    // 3. For each year, fetch group data (which now includes all participant info)
    const curatedGroups: Record<number, CuratedV2Group> = {};
    for (const year of years) {
      const groupRes = await fetch(`${BASE_URL}/admin/sticky-groups/${year}`, {
        next: {
          revalidate: 172800,
          tags: ["sticky-groups"],
        },
      });
      if (!groupRes.ok) continue;
      const group = await groupRes.json();
      const group_photo_url = group.group_photo_url || null;
      const groupParticipants: APIGroupParticipant[] = group.participants || [];

      // Map API participant structure to CuratedV2Participant
      const participants: CuratedV2Participant[] = groupParticipants.map(
        (p) => ({
          userId: p.user_id,
          slug: p.slug,
          userName: p.name,
          image: {
            image_url: p.image_url || "/placeholder.jpg",
            alt: `${p.name} profile image - participant from GLUE design routes`,
          },
        })
      );

      curatedGroups[year] = {
        year,
        group_photo_url,
        participants,
      };
    }

    return { headerData, curatedGroups };
  } catch (error) {
    console.error("Error fetching curated section v2:", error);
    // Return fallback data on error
    return {
      headerData: FALLBACK_HEADER_DATA,
      curatedGroups: {},
    };
  }
}
