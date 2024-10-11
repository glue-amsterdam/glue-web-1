import { Participant } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const getRandomNumber = () => Math.floor(Math.random() * 4) + 1;

  const participants: Participant[] = [
    {
      id: 1,
      name: "John Doe",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://johndoe.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 2,
      name: "Jane Smith",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://janesmith.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 3,
      name: "Bob Johnson",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://bobjohnson.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 4,
      name: "Alice Brown",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://alicebrown.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 5,
      name: "Charlie Davis",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://charliedavis.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 6,
      name: "Eva Wilson",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://evawilson.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
  ];

  return NextResponse.json(participants);
}
