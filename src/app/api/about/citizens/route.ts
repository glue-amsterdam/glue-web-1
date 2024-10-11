import { Citizen } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const getRandomNumber = () => Math.floor(Math.random() * 4) + 1;

  const citizens: Citizen[] = [
    {
      id: 1,
      name: "Emma Johnson",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Emma Johnson is a renowned architect known for her innovative sustainable designs.",
      year: 2023,
    },
    {
      id: 2,
      name: "Michael Chen",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Michael Chen is a fashion designer who incorporates architectural elements into his clothing lines.",
      year: 2023,
    },
    {
      id: 3,
      name: "Sophia Patel",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Sophia Patel is a structural engineer who bridges the gap between fashion and architecture.",
      year: 2023,
    },
    {
      id: 4,
      name: "David Lee",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "David Lee is an urban planner who integrates fashion concepts into city designs.",
      year: 2024,
    },
    {
      id: 5,
      name: "Olivia Martinez",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Olivia Martinez is a textile innovator creating sustainable fabrics for both fashion and architecture.",
      year: 2024,
    },
    {
      id: 6,
      name: "Alexander Kim",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Alexander Kim is a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
      year: 2024,
    },
    {
      id: 7,
      name: "Isabella Nguyen",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Isabella Nguyen is a virtual reality designer creating immersive architectural fashion experiences.",
      year: 2025,
    },
    {
      id: 8,
      name: "Ethan Carter",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Ethan Carter is a biomimicry specialist applying nature-inspired designs to both buildings and clothing.",
      year: 2025,
    },
    {
      id: 9,
      name: "Zoe Anderson",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Zoe Anderson is an acoustics expert designing spaces and garments that interact with sound.",
      year: 2025,
    },
    // Add the remaining citizens here if needed
  ];

  const years = Array.from(
    new Set(citizens.map((citizen) => citizen.year))
  ).sort((a, b) => b - a);

  return NextResponse.json({ citizens, years });
}
