import { PressItem } from "@/utils/about-types";
import { getRandomNumber } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function GET() {
  const pressItems: PressItem[] = [
    {
      id: 1,
      title: "GLUE TV",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
      description:
        "Watch our latest videos showcasing the intersection of architecture and fashion.",
    },
    {
      id: 2,
      title: "Press",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
      description:
        "Read the latest news and articles featuring GLUE and our innovative projects.",
    },
  ];

  return NextResponse.json(pressItems);
}
