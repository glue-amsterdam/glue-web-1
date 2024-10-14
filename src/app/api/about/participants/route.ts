import { participants } from "@/lib/mockusers";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(participants);
}
