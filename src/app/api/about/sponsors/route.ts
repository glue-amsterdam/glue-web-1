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
      sponsorT: "Sponsor Type",
    },
    {
      id: 2,
      name: "Sponsor 2",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor2.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 3,
      name: "Sponsor 3",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor3.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 4,
      name: "Sponsor 4",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor4.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 5,
      name: "Sponsor 5",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 6,
      name: "Sponsor 6",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 7,
      name: "Sponsor 7",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 8,
      name: "Sponsor 8",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 9,
      name: "Sponsor 9",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 10,
      name: "Sponsor 10",
      logo: `https://picsum.photos/id/${getRandomNumber()}/100/200`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
  ];

  return NextResponse.json(sponsors);
}
