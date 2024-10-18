import { members } from "@/lib/mockMembers";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(members);
}
