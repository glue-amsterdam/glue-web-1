import { Citizen } from "@/utils/about-types";
import { getRandomNumber } from "@/utils/functions";
import { NextResponse } from "next/server";

export async function GET() {
  const citizens: Citizen[] = [
    {
      id: 1,
      name: "Emma Johnson",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Emma Johnson is a renowned architect known for her innovative sustainable designs.",
      year: 2023,
    },
    {
      id: 2,
      name: "Michael Chen",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Michael Chen is a fashion designer who incorporates architectural elements into his clothing lines.",
      year: 2023,
    },
    {
      id: 3,
      name: "Sophia Patel",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Sophia Patel is a structural engineer who bridges the gap between fashion and architecture.",
      year: 2023,
    },
    {
      id: 4,
      name: "David Lee",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "David Lee is an urban planner who integrates fashion concepts into city designs.",
      year: 2024,
    },
    {
      id: 5,
      name: "Olivia Martinez",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Olivia Martinez is a textile innovator creating sustainable fabrics for both fashion and architecture.",
      year: 2024,
    },
    {
      id: 6,
      name: "Alexander Kim",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Alexander Kim is a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
      year: 2024,
    },
    {
      id: 7,
      name: "Isabella Nguyen",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Isabella Nguyen is a virtual reality designer creating immersive architectural fashion experiences.",
      year: 2025,
    },
    {
      id: 8,
      name: "Ethan Carter",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Ethan Carter is a biomimicry specialist applying nature-inspired designs to both buildings and clothing.",
      year: 2025,
    },
    {
      id: 9,
      name: "Zoe Anderson",
      image: `https://picsum.photos/id/${getRandomNumber()}/300/200`,
      description:
        "Zoe Anderson is an acoustics expert designing spaces and garments that interact with sound.",
      year: 2025,
    },
  ];

  const years = Array.from(
    new Set(citizens.map((citizen) => citizen.year))
  ).sort((a, b) => b - a);

  return NextResponse.json({ citizens, years });
}
