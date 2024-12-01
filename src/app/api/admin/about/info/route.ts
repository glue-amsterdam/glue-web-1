import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import {
  infoItemsSectionSchema,
  InfoSectionContent,
} from "@/schemas/baseSchema";

export async function GET() {
  try {
    const supabase = await createClient();

    const [{ data: infoData }, { data: infoItemsData }] = await Promise.all([
      supabase.from("about_info").select("*").single(),
      supabase.from("about_info_items").select("*").order("created_at"),
    ]);

    if (!infoData || !infoItemsData) {
      throw new Error("Failed to fetch info section data or items");
    }

    const infoSection: InfoSectionContent = {
      title: infoData.title,
      description: infoData.description,
      infoItems: infoItemsData.map(
        ({ id, title, description, image_url, alt, image_name }) => ({
          id,
          title,
          description,
          image: { image_url, alt, image_name, id },
        })
      ),
    };

    return NextResponse.json(infoSection);
  } catch (error) {
    console.error("Error in GET /admin/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching info section data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const body = await request.json();

    // Validate the incoming data
    const validatedData = infoItemsSectionSchema.parse(body);

    // Update the main info section data
    const { error: infoError } = await supabase
      .from("about_info")
      .upsert({
        title: validatedData.title,
        description: validatedData.description,
      })
      .eq("id", "about-info-56ca13952fcc");

    if (infoError) throw infoError;

    // Get existing info items
    const { data: existingItems, error: fetchError } = await supabase
      .from("about_info_items")
      .select("id, image_url")
      .eq("info_id", "about-info-56ca13952fcc");

    if (fetchError) throw fetchError;

    // Update or insert the info items
    const { error: itemsError } = await supabase
      .from("about_info_items")
      .upsert(
        validatedData.infoItems.map((item) => ({
          title: item.title,
          description: item.description,
          image_url: item.image.image_url,
          alt: item.image.alt,
          image_name: item.image.image_name,
          info_id: "about-info-56ca13952fcc",
        }))
      );

    if (itemsError) throw itemsError;

    // Identify items to be deleted
    const currentItemIds = validatedData.infoItems.map((item) => item.id);
    const itemsToDelete = existingItems?.filter(
      (item) => !currentItemIds.includes(item.id)
    );

    if (itemsToDelete && itemsToDelete.length > 0) {
      // Delete items from the database
      const { error: deleteError } = await supabase
        .from("about_info_items")
        .delete()
        .in(
          "id",
          itemsToDelete.map((item) => item.id)
        );

      if (deleteError) throw deleteError;

      // Delete corresponding images from the storage bucket
      for (const item of itemsToDelete) {
        try {
          const url = new URL(item.image_url);
          const pathParts = url.pathname.split("/");
          const filename = pathParts[pathParts.length - 1];
          const filePath = `about/info-items/${filename}`;

          const { error: storageError } = await supabase.storage
            .from("amsterdam-assets")
            .remove([filePath]);

          if (storageError) {
            console.error(`Failed to delete image ${filePath}:`, storageError);
          }
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
        }
      }
    }

    return NextResponse.json({ message: "Info section updated successfully" });
  } catch (error) {
    console.error("Error in POST /admin/about/info:", error);
    return NextResponse.json(
      { error: "An error occurred while updating info section data" },
      { status: 500 }
    );
  }
}
