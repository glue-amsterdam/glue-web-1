import { locationGroups } from "@/lib/mockMap";
import { NextResponse } from "next/server";

export async function GET() {
  // Simular un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(locationGroups);
}
