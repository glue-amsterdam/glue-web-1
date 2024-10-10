import { NextResponse } from "next/server";
import { getRandomNumber } from "@/utils/functions";
import { InfoItem } from "@/utils/about-types";

export async function GET() {
  const infoItems: InfoItem[] = [
    {
      id: 1,
      title: "Mission Statement",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
      description:
        "Our mission is to bridge the gap between architecture and fashion, creating innovative designs that push the boundaries of both fields.",
    },
    {
      id: 2,
      title: "Meet the Team",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
      description:
        "Our diverse team of architects, fashion designers, and engineers work together to create groundbreaking concepts and products.",
    },
    {
      id: 3,
      title: "GLUE Foundation",
      image: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
      description:
        "The GLUE Foundation supports emerging talents in the fields of architecture and fashion, fostering collaboration and innovation.",
    },
  ];
  return NextResponse.json(infoItems);
}
