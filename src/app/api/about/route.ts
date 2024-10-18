import { mockAbout } from "@/lib/mockAbout";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(mockAbout);
}
