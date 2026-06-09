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
      .select("title, description, is_visible")
      .single();

    if (headerError) {
      console.error("Error fetching header data:", headerError);
      throw headerError;
    }

    if (!section.is_visible) {
      return NextResponse.json({
        title: "",
        description: "",
        is_visible: false,
        citizensByYear: {},
      });
    }

    const { data: citizens = [], error } = await supabase
      .from("about_citizens")
      .select("id, name, image_url, description, year")
      .order("year", { ascending: false });

    if (error) {
      throw error;
    }

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
    };

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
