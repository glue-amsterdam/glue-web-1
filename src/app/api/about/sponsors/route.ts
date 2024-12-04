import {
  SponsorsSection,
  sponsorsSectionSchema,
} from "@/schemas/sponsorsSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: sponsorsHeaderData, error: sponsorsHeaderError } =
      await supabase
        .from("about_sponsors_header")
        .select("*")
        .eq("id", "about-sponsors-header-section-56ca13952fcc")
        .single();

    const { data: sponsorsData, error: sponsorsError } = await supabase
      .from("about_sponsors")
      .select("*");

    if (sponsorsHeaderError || sponsorsError) {
      return NextResponse.json(
        { error: "Failed to fetch sponsors data" },
        { status: 500 }
      );
    }

    const response: SponsorsSection = {
      sponsorsHeaderSchema: sponsorsHeaderData,
      sponsors: sponsorsData,
    };

    // Validate response with client schema
    const validatedResponse = sponsorsSectionSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Error in GET /api/about/sponsors:", error);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch sponsors data" },
        { status: 500 }
      );
    }
  }
}
