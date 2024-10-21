import { NextResponse } from "next/server";
import { mainSection } from "@/lib/mockMain";

export async function GET() {
  return NextResponse.json(mainSection);
}
