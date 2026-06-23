import { revalidateHomeCitizensCache } from "@/lib/home";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    // Fetch the citizens section data
    const { data: sectionData, error: sectionError } = await auth.supabase
      .from("about_citizens_section")
      .select("*")
      .eq("id", "about-citizens-section")
      .single();

    if (sectionError) throw sectionError;

    // Fetch all citizens
    const { data: citizensData, error: citizensError } = await auth.supabase
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
  try {
    const auth = await requireAdminToken();
    if (!auth.ok) return auth.response;

    const body = await request.json();

    const { data, error } = await auth.supabase
      .from("about_citizens_section")
      .update({
        title: body.title,
        description: body.description,
        is_visible: body.is_visible,
      })
      .eq("id", "about-citizens-section")
      .select();
    if (error) throw error;

    revalidateHomeCitizensCache();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating citizens section data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
