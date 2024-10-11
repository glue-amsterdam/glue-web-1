import { CuratedMember } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const curatedMembers: CuratedMember[] = [
    { id: 1, name: "Alice Johnson", year: 2023 },
    { id: 2, name: "Bob Smith", year: 2023 },
    { id: 3, name: "Charlie Brown", year: 2023 },
    { id: 4, name: "Diana Ross", year: 2023 },
    { id: 5, name: "Eva Green", year: 2024 },
    { id: 6, name: "Frank Sinatra", year: 2024 },
    { id: 7, name: "Grace Kelly", year: 2024 },
    { id: 8, name: "Henry Ford", year: 2024 },
    { id: 9, name: "Iris West", year: 2025 },
    { id: 10, name: "Jack Black", year: 2025 },
    { id: 11, name: "Kate Winslet", year: 2025 },
    { id: 12, name: "Liam Neeson", year: 2025 },
  ];

  const years = Array.from(
    new Set(curatedMembers.map((curatedMember) => curatedMember.year))
  ).sort((a, b) => b - a);

  return NextResponse.json({ curatedMembers, years });
}
