import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { CitizensSection } from "@/schemas/citizenSchema";

export async function GET() {
  const supabase = await createClient();

  try {
    // Fetch the main section data
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

    const responseData: CitizensSection = {
      title: sectionData.title,
      description: sectionData.description,
      citizensByYear,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching citizens of honor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch citizens of honor data" },
      { status: 500 }
    );
  }
}
