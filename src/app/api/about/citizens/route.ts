import { clientCitizensSectionSchema } from "@/schemas/citizenSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: citizens, error } = await supabase
      .from("about_citizens")
      .select("id, name, image_url, alt, description, year")
      .order("year", { ascending: false });

    if (error) {
      throw error;
    }

    // Group citizens by year
    const citizensByYear = citizens.reduce((acc, citizen) => {
      if (!acc[citizen.year]) {
        acc[citizen.year] = [];
      }
      acc[citizen.year].push(citizen);
      return acc;
    }, {} as Record<string, typeof citizens>);

    const { data: section } = await supabase
      .from("about_citizens_section")
      .select("title, description")
      .single();

    const response = {
      title: section?.title || "Citizens of Honor",
      description: section?.description || "",
      citizensByYear,
    };

    // Validate response with client schema
    const validatedResponse = clientCitizensSectionSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error in GET /api/about/citizens:", error);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch citizens data" },
        { status: 500 }
      );
    }
  }
}
