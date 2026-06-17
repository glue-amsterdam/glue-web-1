import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateSiteThemeCache } from "@/lib/main/revalidate-site-theme-cache";

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
        subItems?: Array<{
          href: string;
          title: string;
          is_visible: boolean;
          place: number;
        }>;
      }) => ({
        menu_id: item.menu_id,
        label: item.label,
        section: item.section,
        className: item.className,
        subItems: item.subItems ? JSON.stringify(item.subItems) : null,
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

    const parsedData = data.map((item) => ({
      ...item,
      subItems: item.subItems ? JSON.parse(item.subItems) : null,
    }));

    revalidateSiteThemeCache();

    return NextResponse.json({ mainMenu: parsedData });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
