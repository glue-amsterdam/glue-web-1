import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { CarouselSectionContent } from "@/schemas/baseSchema";

export async function GET() {
  const supabase = await createClient();
  const { data: carouselData, error: carouselError } = await supabase
    .from("about_carousel")
    .select("*")
    .single();

  if (carouselError) {
    console.error("Error fetching carousel data:", carouselError);
    return NextResponse.json(
      { error: "Failed to fetch carousel data" },
      { status: 500 }
    );
  }

  const { data: slidesData, error: slidesError } = await supabase
    .from("about_carousel_slides")
    .select("*")
    .order("id");

  if (slidesError) {
    console.error("Error fetching carousel slides:", slidesError);
    return NextResponse.json(
      { error: "Failed to fetch carousel slides" },
      { status: 500 }
    );
  }

  const carouselSection: CarouselSectionContent = {
    title: carouselData.title,
    description: carouselData.description,
    slides: slidesData,
  };

  return NextResponse.json(carouselSection);
}
