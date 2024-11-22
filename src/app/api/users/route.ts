import { NextResponse } from "next/server";
import { users } from "@/lib/mockMembers";

export async function GET() {
  return NextResponse.json(users);
}
