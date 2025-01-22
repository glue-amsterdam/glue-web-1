import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  try {
    // Fetch the citizens section data
    const { data: sectionData, error: sectionError } = await supabase
      .from("about_citizens_section")
      .select("*")
      .eq("id", "about-citizens-section")
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

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("about_citizens_section")
      .update({
        title: body.title,
        description: body.description,
        is_visible: body.is_visible,
      })
      .eq("id", "about-citizens-section")
      .select();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating citizens section data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
