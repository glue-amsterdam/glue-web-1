import { members } from "@/lib/mockMembers";
import { MembersResponse } from "@/utils/member-types";
import { NextResponse } from "next/server";

export async function GET() {
  const response: MembersResponse = { members };
  return NextResponse.json(response);
}
