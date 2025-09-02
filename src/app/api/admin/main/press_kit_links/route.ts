import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  pressKitLinksSchema,
  pressKitLinksFormSchema,
} from "@/schemas/mainSchema";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: pressKitLinks, error } = await supabase
      .from("press_kit_links")
      .select("*")
      .order("id");

    if (error) {
      throw new Error(`Error fetching press kit links: ${error.message}`);
    }

    const response = { pressKitLinks };

    // Validate the response against the schema
    const validatedResponse = pressKitLinksSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error in GET /api/admin/main/press_kit_links:", error);
    return NextResponse.json(
      { error: "Failed to fetch press kit links" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    // Create a new link with empty fields initially
    const newLinkData = {
      link: body.link || "",
      description: body.description || null,
    };

    const { data, error } = await supabase
      .from("press_kit_links")
      .insert([newLinkData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating press kit link:", error);
    return NextResponse.json(
      { error: "Failed to create press kit link" },
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
    const validatedData = pressKitLinksFormSchema.parse(body);
    const pressKitLinks = validatedData.pressKitLinks;

    console.log("Validated pressKitLinks:", pressKitLinks);

    // Update links one by one
    const updatePromises = pressKitLinks.map(async (link) => {
      const { data, error } = await supabase
        .from("press_kit_links")
        .update({
          link: link.link,
          description: link.description,
        })
        .eq("id", link.id)
        .select();

      if (error) {
        throw error;
      }
      return data[0];
    });

    const updatedLinks = await Promise.all(updatePromises);

    const response = { pressKitLinks: updatedLinks };

    // Validate the response against the schema
    const validatedResponse = pressKitLinksSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error updating press kit links:", error);
    return NextResponse.json(
      { error: "Failed to update press kit links" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("press_kit_links")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting press kit link:", error);
    return NextResponse.json(
      { error: "Failed to delete press kit link" },
      { status: 500 }
    );
  }
}
