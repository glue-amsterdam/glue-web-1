import { MainSectionContent } from "@/utils/about-types";
import { getRandomNumber } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function GET() {
  const mainSection: MainSectionContent = {
    title: "GLUE connected by design",
    description:
      "A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.",
    slides: [
      {
        id: 1,
        src: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
        alt: "Innovative architectural fashion design 1",
      },
      {
        id: 2,
        src: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
        alt: "Cutting-edge fashion structure 2",
      },
      {
        id: 3,
        src: `https://picsum.photos/id/${getRandomNumber()}/200/300`,
        alt: "Fusion of architecture and style 3",
      },
    ],
  };

  return NextResponse.json(mainSection);
}
