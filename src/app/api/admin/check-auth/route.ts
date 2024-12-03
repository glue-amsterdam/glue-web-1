import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  console.log("Admin token:", adminToken); // For debugging

  if (adminToken) {
    return NextResponse.json({ isAdmin: true });
  } else {
    return NextResponse.json({ isAdmin: false });
  }
}
