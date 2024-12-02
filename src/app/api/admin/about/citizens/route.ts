import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  try {
    // Fetch the citizens section data
    const { data: sectionData, error: sectionError } = await supabase
      .from("about_citizens_section")
      .select("*")
      .eq("id", "about-citizens-section-56ca13952fcc")
      .single();

    if (sectionError) throw sectionError;

    // Fetch all citizens
    const { data: citizensData, error: citizensError } = await supabase
      .from("about_citizens")
      .select("*")
      .order("year", { ascending: false });

    if (citizensError) throw citizensError;

    // Group citizens by year
    const citizensByYear = citizensData.reduce((acc, citizen) => {
      if (!acc[citizen.year]) {
        acc[citizen.year] = [];
      }
      acc[citizen.year].push(citizen);
      return acc;
    }, {} as Record<string, typeof citizensData>);

    // Construct the complete section data
    const completeSection = {
      ...sectionData,
      citizensByYear,
    };

    return NextResponse.json(completeSection);
  } catch (error) {
    console.error("Error fetching citizens data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { citizensSectionSchema } from "@/schemas/citizenSchema";
import { cookies } from "next/headers";

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

    // Validate the incoming data
    const validatedData = citizensSectionSchema.parse(body);

    // Update the main citizens section data
    const { error: sectionError } = await supabase
      .from("about_citizens_section")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
      })
      .eq("id", "about-citizens-section-56ca13952fcc");

    if (sectionError) throw sectionError;

    // Get existing citizens
    const { data: existingCitizens, error: fetchError } = await supabase
      .from("about_citizens")
      .select("id, image_url, year")
      .eq("section_id", "about-citizens-section-56ca13952fcc");

    if (fetchError) throw fetchError;

    // Prepare citizens data for upsert
    const citizensToUpsert = Object.entries(
      validatedData.citizensByYear
    ).flatMap(([year, citizens]) =>
      citizens.map((citizen) => ({
        id: citizen.id,
        name: citizen.name,
        description: citizen.description,
        image_url: citizen.image.image_url,
        image_name: citizen.image.image_name,
        alt: citizen.image.alt,
        year,
        section_id: "about-citizens-section-56ca13952fcc",
      }))
    );

    // Update the citizens
    const { error: citizensError } = await supabase
      .from("about_citizens")
      .upsert(citizensToUpsert);

    if (citizensError) throw citizensError;

    // Identify citizens to be deleted
    const currentCitizenIds = citizensToUpsert.map((citizen) => citizen.id);
    const citizensToDelete = existingCitizens?.filter(
      (citizen) => !currentCitizenIds.includes(citizen.id)
    );

    if (citizensToDelete && citizensToDelete.length > 0) {
      // Delete citizens from the database
      const { error: deleteError } = await supabase
        .from("about_citizens")
        .delete()
        .in(
          "id",
          citizensToDelete.map((citizen) => citizen.id)
        );

      if (deleteError) throw deleteError;

      // Delete corresponding images from the storage bucket
      for (const citizen of citizensToDelete) {
        try {
          const url = new URL(citizen.image_url);
          const pathParts = url.pathname.split("/");
          const filename = pathParts[pathParts.length - 1];
          const filePath = `about/citizens/${citizen.year}/${filename}`;

          console.log(`Attempting to delete image: ${filePath}`);

          const { error: storageError } = await supabase.storage
            .from("amsterdam-assets")
            .remove([filePath]);

          if (storageError) {
            console.error(`Failed to delete image: ${filePath}`, storageError);
          } else {
            console.log(`Successfully deleted image: ${filePath}`);
          }
        } catch (error) {
          console.error(
            `Error processing image deletion for citizen ${citizen.id}:`,
            error
          );
        }
      }
    }

    return NextResponse.json({
      message: "Citizens section updated successfully",
    });
  } catch (error) {
    console.error("Error in POST /admin/about/citizens:", error);
    return NextResponse.json(
      { error: "An error occurred while updating citizens data" },
      { status: 500 }
    );
  }
}
