import { Sponsor } from "@/utils/about-types";
import { getRandomNumber } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function GET() {
  const sponsors: Sponsor[] = [
    {
      id: 1,
      name: "Sponsor 1",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor1.com",
    },
    {
      id: 2,
      name: "Sponsor 2",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor2.com",
    },
    {
      id: 3,
      name: "Sponsor 3",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor3.com",
    },
    {
      id: 4,
      name: "Sponsor 4",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor4.com",
    },
    {
      id: 5,
      name: "Sponsor 5",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
    },
  ];

  return NextResponse.json(sponsors);
}
