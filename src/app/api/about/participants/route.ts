import { Participant } from "@/utils/about-types";
import { getRandomNumber } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function GET() {
  const participants: Participant[] = [
    {
      id: 1,
      name: "John Doe",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/200`,
      website: "https://johndoe.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 2,
      name: "Jane Smith",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/200`,
      website: "https://janesmith.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 3,
      name: "Bob Johnson",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/200`,
      website: "https://bobjohnson.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 4,
      name: "Alice Brown",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/200`,
      website: "https://alicebrown.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 5,
      name: "Charlie Davis",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/200`,
      website: "https://charliedavis.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
    {
      id: 6,
      name: "Eva Wilson",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/200`,
      website: "https://evawilson.com",
      description:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit sed",
    },
  ];

  return NextResponse.json(participants);
}
