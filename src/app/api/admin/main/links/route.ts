import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateMainLinksCache } from "@/lib/main/revalidate-main-links-cache";
import { LinkItemAdmin, MainLinksAdmin, mainLinksAdminSchema } from "@/schemas/mainSchema";

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

    const linksWithoutId = mainLinks.map(({ platform, link }) => ({
      platform,
      link,
    }));

    const response: MainLinksAdmin = { mainLinks: linksWithoutId };

    // Validate the response against the schema
    const validatedResponse = mainLinksAdminSchema.parse(response);

    return NextResponse.json(validatedResponse);
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
    const body = await request.json();

    // Validate the incoming data against the schema
    const validatedData = mainLinksAdminSchema.parse(body);
    const mainLinks = validatedData.mainLinks;

    console.log("Validated mainLinks:", mainLinks);

    // Update links one by one
    const updatePromises = mainLinks.map(async (link: LinkItemAdmin) => {
      const { data, error } = await supabase
        .from("main_links")
        .update({ link: link.link?.trim() ?? "" })
        .eq("platform", link.platform)
        .select();

      if (error) {
        throw error;
      }
      return data[0];
    });

    const updatedLinks = await Promise.all(updatePromises);

    const response: MainLinksAdmin = { mainLinks: updatedLinks };

    // Validate the response against the schema
    const validatedResponse = mainLinksAdminSchema.parse(response);

    revalidateMainLinksCache();

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error updating main links:", error);
    return NextResponse.json(
      { error: "Failed to update main links" },
      { status: 500 }
    );
  }
}
