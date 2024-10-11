import { MainSectionContent } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const mainSection: MainSectionContent = {
    title: "GLUE connected by design",
    description:
      "A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.",
    slides: [
      {
        id: 1,
        src: `/placeholders/placeholder-1.jpg`,
        alt: "Innovative architectural fashion design 1",
      },
      {
        id: 2,
        src: `/placeholders/placeholder-2.jpg`,
        alt: "Cutting-edge fashion structure 2",
      },
      {
        id: 3,
        src: `/placeholders/placeholder-3.jpg`,
        alt: "Fusion of architecture and style 3",
      },
    ],
  };

  return NextResponse.json(mainSection);
}
