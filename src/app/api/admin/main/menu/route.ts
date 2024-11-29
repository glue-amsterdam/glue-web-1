import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = await createClient();
  const { data: mainMenu, error } = await supabase
    .from("main_menu")
    .select("*");

  if (error) {
    console.error("Error fetching main section:", error);
    return NextResponse.json(
      { error: "Failed to fetch main menu" },
      { status: 500 }
    );
  }

  if (!mainMenu || mainMenu.length === 0) {
    return NextResponse.json({ error: "Main menu not found" }, { status: 404 });
  }

  return NextResponse.json({ mainMenu });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const { mainMenu } = await request.json();

    const updates = mainMenu.map(
      (item: {
        menu_id: string;
        label: string;
        section: string;
        className: string;
      }) => ({
        menu_id: item.menu_id,
        label: item.label,
        section: item.section,
        className: item.className,
      })
    );

    const { data, error } = await supabase
      .from("main_menu")
      .upsert(updates, { onConflict: "menu_id" })
      .select();

    if (error) {
      console.error("Error updating main section:", error);
      return NextResponse.json(
        { error: "Failed to update main section" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mainMenu: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}