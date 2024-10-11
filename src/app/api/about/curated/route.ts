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
    { id: 13, name: "Meryl Streep", year: 2023 },
    { id: 14, name: "Nina Simone", year: 2023 },
    { id: 15, name: "Orson Welles", year: 2023 },
    { id: 16, name: "Pablo Picasso", year: 2023 },
    { id: 17, name: "Quentin Tarantino", year: 2024 },
    { id: 18, name: "Rihanna Fenty", year: 2024 },
    { id: 19, name: "Stan Lee", year: 2024 },
    { id: 20, name: "Taylor Swift", year: 2024 },
    { id: 21, name: "Uma Thurman", year: 2025 },
    { id: 22, name: "Vincent van Gogh", year: 2025 },
    { id: 23, name: "Walt Disney", year: 2025 },
    { id: 24, name: "Xena Warrior Princess", year: 2025 },
    { id: 25, name: "Yoko Ono", year: 2023 },
    { id: 26, name: "Zack Snyder", year: 2023 },
    { id: 27, name: "Adele Laurie", year: 2024 },
    { id: 28, name: "Bruce Wayne", year: 2024 },
  ];

  const years = Array.from(
    new Set(curatedMembers.map((curatedMember) => curatedMember.year))
  ).sort((a, b) => b - a);

  return NextResponse.json({ curatedMembers, years });
}
