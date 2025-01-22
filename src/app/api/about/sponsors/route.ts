import {
  SponsorsSection,
  sponsorsSectionSchema,
} from "@/schemas/sponsorsSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: headerData, error: headerError } = await supabase
      .from("about_sponsors_header")
      .select("*")
      .eq("id", "about-sponsors-header-section")
      .single();

    if (headerError) {
      console.error("Error fetching sponsors header data:", headerError);
      throw headerError;
    }

    if (!headerData.is_visible) {
      return NextResponse.json({
        sponsorsHeaderSchema: {
          id: "sponsors-section",
          title: "Sponsor data is not yet available. ",
          is_visible: false,
          description: "Sponsor data is not yet available.",
          sponsors_types: [],
        },
        sponsors: [],
      });
    }

    const { data: sponsorsData, error: sponsorsError } = await supabase
      .from("about_sponsors")
      .select("*");

    if (sponsorsError) {
      console.error("Error fetching participant details:", sponsorsError);
      throw sponsorsError;
    }

    const response: SponsorsSection = {
      sponsorsHeaderSchema: headerData,
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
