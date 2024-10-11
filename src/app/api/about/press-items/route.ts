import { PressItem } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const getRandomNumber = () => Math.floor(Math.random() * 3) + 1;

  const pressItems: PressItem[] = [
    {
      id: 1,
      title: "GLUE TV",
      image: `placeholders/placeholder-${getRandomNumber()}.jpg`,
      description:
        "Watch our latest videos showcasing the intersection of architecture and fashion.",
    },
    {
      id: 2,
      title: "Press",
      image: `placeholders/placeholder-${getRandomNumber()}.jpg`,
      description:
        "Read the latest news and articles featuring GLUE and our innovative projects.",
    },
  ];

  return NextResponse.json(pressItems);
}
