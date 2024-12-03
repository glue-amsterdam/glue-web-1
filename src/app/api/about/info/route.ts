import {
  InfoSectionClient,
  infoSectionClientSchema,
} from "@/schemas/infoSchema";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const INFO_FALLBACK_DATA: InfoSectionClient = {
  title: "Information about GLUE",
  description:
    "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
  infoItems: [
    {
      id: "mission-statement",
      title: "Mission Statement",
      description:
        "<p>GLUE aspires to diversity and inclusivity, with a focus on sustainability and wellbeing.</p>",
      image: {
        image_url: "/placeholder.svg?height=400&width=600",
        alt: "GLUE Mission Statement",
      },
    },
    {
      id: "meet-the-team",
      title: "Meet the Team",
      description:
        "<p>Our dedicated team works tirelessly to connect and promote the Amsterdam design community.</p>",
      image: {
        image_url: "/placeholder.svg?height=400&width=600",
        alt: "GLUE Team",
      },
    },
    {
      id: "glue-foundation",
      title: "GLUE Foundation",
      description:
        "<p>The GLUE Foundation is responsible for cultural programs and initiatives within the GLUE community.</p>",
      image: {
        image_url: "/placeholder.svg?height=400&width=600",
        alt: "GLUE Foundation",
      },
    },
  ],
};

export async function GET() {
  try {
    if (process.env.NEXT_PHASE === "build") {
      console.warn("Using fallback data for info section during build");
      return NextResponse.json(INFO_FALLBACK_DATA);
    }
    const supabase = await createClient();

    const [{ data: infoData }, { data: infoItemsData }] = await Promise.all([
      supabase
        .from("about_info")
        .select("*")
        .eq("id", "about-info-56ca13952fcc")
        .single(),
      supabase
        .from("about_info_items")
        .select("id, title, description, image_url, alt")
        .eq("info_id", "about-info-56ca13952fcc")
        .order("created_at"),
    ]);

    if (!infoData || !infoItemsData) {
      throw new Error("Failed to fetch info section data or items");
    }

    if (!infoData) {
      throw new Error("Failed to fetch info section data");
    }

    const infoSection = {
      title: infoData.title,
      description: infoData.description,
      infoItems: infoItemsData.map((item) => ({
        description: item.description,
        id: item.id,
        title: item.title,
        image: {
          image_url: item.image_url,
          alt: item.alt,
        },
      })),
    };

    const validatedData = infoSectionClientSchema.parse(infoSection);

    return NextResponse.json(validatedData);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to fetch info section data" },
        { status: 500 }
      );
    } else {
      console.warn("Using fallback data for citizens");
      return NextResponse.json(INFO_FALLBACK_DATA);
    }
  }
}
