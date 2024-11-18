import { NextResponse } from "next/server";
import { mockSponsors } from "@/lib/mockSponsors";
import { Sponsor } from "@/utils/sponsors-types";

export async function GET() {
  return NextResponse.json(mockSponsors);
}
export async function POST(request: Request) {
  const newSponsor: Sponsor = await request.json();

  // In a real application, you'd add this to your database
  mockSponsors.push(newSponsor);

  return NextResponse.json(mockSponsors);
}

export async function PUT(request: Request) {
  const updatedSponsors: Sponsor[] = await request.json();

  // In a real application, you'd update your database
  /* mockSponsors = updatedSponsors; */

  return NextResponse.json(updatedSponsors);
}
