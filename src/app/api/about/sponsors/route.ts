import { Sponsor } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const getRandomNumber = () => Math.floor(Math.random() * 4) + 1;

  const sponsors: Sponsor[] = [
    {
      id: 1,
      name: "Sponsor 1",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor1.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 2,
      name: "Sponsor 2",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor2.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 3,
      name: "Sponsor 3",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor3.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 4,
      name: "Sponsor 4",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor4.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 5,
      name: "Sponsor 5",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 6,
      name: "Sponsor 6",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 7,
      name: "Sponsor 7",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 8,
      name: "Sponsor 8",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 9,
      name: "Sponsor 9",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 10,
      name: "Sponsor 10",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
  ];

  return NextResponse.json(sponsors);
}
