import plans from "@/lib/mockPlans";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(plans);
}
