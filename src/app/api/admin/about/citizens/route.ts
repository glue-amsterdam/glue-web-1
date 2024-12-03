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
