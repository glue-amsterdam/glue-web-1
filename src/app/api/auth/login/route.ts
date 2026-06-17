import { getNavbarIdentity } from "@/lib/users/get-navbar-identity";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "No user returned from server" }, { status: 500 });
  }

  const identity = await getNavbarIdentity(data.user.id);

  return NextResponse.json({
    user: data.user,
    dashboardHref: identity.dashboardHref,
    isParticipant: identity.isParticipant,
    isVisitorOnly: identity.isVisitorOnly,
  });
}
