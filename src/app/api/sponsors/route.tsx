import { NextResponse } from "next/server";
import { mockSponsors } from "@/lib/mockSponsors";

export async function GET() {
  return NextResponse.json(mockSponsors);
}
