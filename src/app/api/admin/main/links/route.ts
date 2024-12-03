import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mainLinksSchema } from "@/schemas/mainSchema";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: mainLinks, error } = await supabase
      .from("main_links")
      .select("*")
      .order("id");

    if (error) {
      throw new Error(`Error fetching main links: ${error.message}`);
    }

    const validatedLinks = mainLinksSchema.parse(mainLinks);

    const linksWithoutId = validatedLinks.map(({ platform, link }) => ({
      platform,
      link,
    }));

    return NextResponse.json(linksWithoutId);
  } catch (error) {
    console.error("Error in GET /api/admin/main/links:", error);
    return NextResponse.json(
      { error: "Failed to fetch main links" },
      { status: 500 }
    );
  }
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
    const { mainLinks } = await request.json();

    // Update links one by one
    const updatePromises = mainLinks.map(
      async (link: { platform: string; link: string }) => {
        const { data, error } = await supabase
          .from("main_links")
          .update({ link: link.link })
          .eq("platform", link.platform)
          .select();

        if (error) {
          throw error;
        }
        return data[0];
      }
    );

    const updatedLinks = await Promise.all(updatePromises);

    return NextResponse.json({ mainLinks: updatedLinks });
  } catch (error) {
    console.error("Error updating main links:", error);
    return NextResponse.json(
      { error: "Failed to update main links" },
      { status: 500 }
    );
  }
}
