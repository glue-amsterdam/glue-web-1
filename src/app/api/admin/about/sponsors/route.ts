import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sponsorSchema } from "@/schemas/sponsorsSchema";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("about_sponsors").select("*");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/admin/sponsors", error);
    return NextResponse.json(
      { error: "An error occurred while fetching sponsors" },
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

  const supabase = await createClient();

  try {
    const body = await request.json();
    const validatedData = sponsorSchema.parse(body);

    // Insert the new sponsor
    const { data, error: insertError } = await supabase
      .from("about_sponsors")
      .insert({
        name: validatedData.name,
        website: validatedData.website,
        sponsor_type: validatedData.sponsor_type,
        image_url: validatedData.image_url,
        alt: validatedData.alt,
      })
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ message: "Sponsor added successfully", data });
  } catch (error) {
    console.error("Error in POST /api/admin/sponsors:", error);
    return NextResponse.json(
      { error: "An error occurred while adding the sponsor" },
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

  const supabase = await createClient();

  try {
    const body = await request.json();
    const validatedData = sponsorSchema.parse(body);

    // Fetch the current sponsor data
    const { data: currentSponsor, error: fetchError } = await supabase
      .from("about_sponsors")
      .select("image_url")
      .eq("id", validatedData.id)
      .single();

    if (fetchError) throw fetchError;

    // Delete old image if a new one is uploaded
    if (
      currentSponsor &&
      validatedData.image_url !== currentSponsor.image_url
    ) {
      const oldImagePath = new URL(currentSponsor.image_url).pathname
        .split("/")
        .pop();
      if (oldImagePath) {
        const { error: deleteError } = await supabase.storage
          .from("amsterdam-assets")
          .remove([`about/sponsors/${oldImagePath}`]);

        if (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }
    }

    // Update the sponsor
    const { data, error: updateError } = await supabase
      .from("about_sponsors")
      .update({
        name: validatedData.name,
        website: validatedData.website,
        sponsor_type: validatedData.sponsor_type,
        image_url: validatedData.image_url,
        alt: validatedData.alt,
      })
      .eq("id", validatedData.id)
      .select();

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Sponsor updated successfully", data });
  } catch (error) {
    console.error("Error in PUT /api/admin/sponsors:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the sponsor" },
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

  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sponsor ID is required" },
        { status: 400 }
      );
    }

    // Get the sponsor data to retrieve the image URL
    const { data: sponsorData, error: fetchError } = await supabase
      .from("about_sponsors")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the image from storage if it exists
    if (sponsorData && sponsorData.image_url) {
      const imagePath = new URL(sponsorData.image_url).pathname
        .split("/")
        .pop();
      const { error: deleteImageError } = await supabase.storage
        .from("amsterdam-assets")
        .remove([`about/sponsors/${imagePath}`]);

      if (deleteImageError) {
        console.error("Error deleting sponsor image:", deleteImageError);
      }
    }

    // Delete the sponsor from the database
    const { error: deleteError } = await supabase
      .from("about_sponsors")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Sponsor deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/sponsors:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the sponsor" },
      { status: 500 }
    );
  }
}
