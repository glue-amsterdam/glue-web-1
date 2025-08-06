import {
  clientCitizensSectionSchema,
  ClientCitizen,
} from "@/schemas/citizenSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: section, error: headerError } = await supabase
      .from("about_citizens_section")
      .select("title, description, is_visible, text_color, background_color")
      .single();

    if (headerError) {
      console.error("Error fetching header data:", headerError);
      throw headerError;
    }

    // If not visible, return early with only header data
    if (!section.is_visible) {
      return NextResponse.json({
        title: "",
        description: "",
        is_visible: false,
        citizensByYear: {},
        text_color: "#ffffff",
        background_color: "#000000",
      });
    }

    const { data: citizens = [], error } = await supabase
      .from("about_citizens")
      .select("id, name, image_url, description, year")
      .order("year", { ascending: false });

    if (error) {
      throw error;
    }

    // Group citizens by year
    const citizensByYear = (citizens as ClientCitizen[]).reduce(
      (acc, citizen) => {
        if (!acc[citizen.year]) {
          acc[citizen.year] = [];
        }
        acc[citizen.year].push(citizen);
        return acc;
      },
      {} as Record<string, ClientCitizen[]>
    );

    const response = {
      title: section?.title,
      description: section?.description,
      is_visible: section?.is_visible,
      citizensByYear,
      text_color: section?.text_color,
      background_color: section?.background_color,
    };

    // Validate response with client schema
    const validatedResponse = clientCitizensSectionSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error in GET /api/about/citizens:", error);
    return NextResponse.json(
      { error: "Failed to fetch citizens data" },
      { status: 500 }
    );
  }
}
