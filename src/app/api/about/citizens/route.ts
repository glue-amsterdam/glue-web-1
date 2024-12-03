import {
  ClientCitizen,
  ClientCitizensSection,
  clientCitizensSectionSchema,
} from "@/schemas/citizenSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const FALLBACK_CITIZEN: ClientCitizen = {
  id: "placeholder",
  name: "Loading...",
  image_url: "/placeholder.jpg",
  alt: "Loading placeholder",
  description: "Loading description...",
  year: "2024",
};

const CITIZENS_FALLBACK_DATA: ClientCitizensSection = {
  title: "Creative Citizens of Honour",
  description: "Loading citizens of honor information...",
  citizensByYear: {
    "2024": Array(3).fill(FALLBACK_CITIZEN),
  },
};

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for citizens section during build");
      return NextResponse.json(CITIZENS_FALLBACK_DATA);
    }
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
    } else {
      console.warn("Using fallback data for citizens");
      return NextResponse.json(CITIZENS_FALLBACK_DATA);
    }
  }
}
