import { revalidateHomeCitizensCache } from "@/lib/home";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { toMediaKey, toMediaUrl } from "@/lib/media/media-url";
import { NextResponse } from "next/server";
import { citizenSchema } from "@/schemas/citizenSchema";
import { config } from "@/config";

export async function GET(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const { year } = params;

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const { data, error } = await auth.supabase
      .from("about_citizens")
      .select("*")
      .eq("year", year)
      .order("id");

    if (error) throw error;

    const citizens = (data ?? []).map((citizen) => ({
      ...citizen,
      image_url: toMediaUrl(citizen.image_url),
    }));

    return NextResponse.json({ citizens });
  } catch (error) {
    console.error(`Error fetching citizens for year ${year}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch citizens for year ${year}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const { year } = params;

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const body = await request.json();

    // Validate the incoming data (without id for creation)
    const validatedData = citizenSchema.omit({ id: true }).parse(body);

    // Generate a unique ID for the new citizen
    const citizenId = `${year}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Prepare citizen data for insertion
    const citizenToInsert = {
      id: citizenId,
      name: validatedData.name,
      description: validatedData.description,
      image_url: toMediaKey(validatedData.image_url),
      image_name: validatedData.image_name,
      year,
      section_id: "about-citizens-section",
    };

    // Insert the new citizen
    const { error: insertError, data: insertedCitizen } = await auth.supabase
      .from("about_citizens")
      .insert(citizenToInsert)
      .select()
      .single();

    if (insertError) throw insertError;

    revalidateHomeCitizensCache(Number(year));

    return NextResponse.json({
      message: `Citizen created successfully for year ${year}`,
      citizen: insertedCitizen
        ? { ...insertedCitizen, image_url: toMediaUrl(insertedCitizen.image_url) }
        : insertedCitizen,
    });
  } catch (error) {
    console.error(`Error in POST /admin/about/citizens/${year}:`, error);
    return NextResponse.json(
      { error: `An error occurred while creating citizen for year ${year}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const params = await props.params;
  const { year } = params;

  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    // Delete citizens for the year
    const { error: deleteError } = await auth.supabase
      .from("about_citizens")
      .delete()
      .eq("year", year)
      .eq("section_id", "about-citizens-section");

    if (deleteError) throw deleteError;

    const yearInt = parseInt(year, 10);
    if (!Number.isNaN(yearInt)) {
      await auth.supabase
        .from("citizens_year_meta")
        .delete()
        .eq("year", yearInt);
    }

    // Delete corresponding images from the storage bucket
    const { data: images, error: fetchError } = await auth.supabase.storage
      .from(config.bucketName)
      .list(`about/citizens/${year}`);

    if (fetchError) throw fetchError;

    if (images && images.length > 0) {
      const { error: storageError } = await auth.supabase.storage
        .from(config.bucketName)
        .remove(images.map((img) => `about/citizens/${year}/${img.name}`));

      if (storageError) throw storageError;
    }

    revalidateHomeCitizensCache(Number(year));

    return NextResponse.json({
      message: `Citizens and images for year ${year} deleted successfully`,
    });
  } catch (error) {
    console.error(`Error in DELETE /admin/about/citizens/${year}:`, error);
    return NextResponse.json(
      { error: `An error occurred while deleting citizens for year ${year}` },
      { status: 500 }
    );
  }
}
