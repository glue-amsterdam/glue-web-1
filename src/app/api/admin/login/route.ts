import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AN_HOUR_IN_S } from "@/constants";

function parseAdminUsers() {
  const adminUsersString = process.env.ADMIN_USERS || "";
  return adminUsersString.split(",").reduce((acc, user) => {
    const [username, password] = user.split(":");
    if (username && password) {
      acc[username] = password;
    }
    return acc;
  }, {} as Record<string, string>);
}

export async function POST(request: Request) {
  const { userName, password } = await request.json();
  const adminUsers = parseAdminUsers();

  if (adminUsers[userName] && adminUsers[userName] === password) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", userName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AN_HOUR_IN_S,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
