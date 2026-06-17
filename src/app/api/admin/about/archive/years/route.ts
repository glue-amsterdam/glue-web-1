import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateAboutArchiveCache } from "@/lib/about/revalidate-about-cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const yearSchema = z.object({
  year: z.number().int(),
  media_type: z.enum(["video", "image"]).nullable().optional(),
  video_src: z.string().optional(),
  video_poster: z.string().optional(),
  video_alt: z.string().optional(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_title: z.string().optional(),
  text_description: z.string().optional(),
});

export async function GET() {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { data: years, error } = await auth.supabase
      .from("about_archive_years")
      .select("*")
      .order("display_order", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      years: years ?? [],
    });
  } catch (error) {
    console.error("Error in GET archive years:", error);
    return NextResponse.json(
      { error: "Failed to fetch archive years" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const validated = yearSchema.parse(body);

    const { data: yearRow, error } = await auth.supabase
      .from("about_archive_years")
      .insert({
        year: validated.year,
        media_type: validated.media_type ?? null,
        video_src: validated.video_src ?? null,
        video_poster: validated.video_poster ?? null,
        video_alt: validated.video_alt ?? null,
        image_src: validated.image_src ?? null,
        image_alt: validated.image_alt ?? null,
        text_title: validated.text_title ?? "",
        text_description: validated.text_description ?? "",
      })
      .select("id")
      .single();

    if (error || !yearRow) {
      throw error;
    }

    revalidateAboutArchiveCache();

    return NextResponse.json({ message: "Archive year created", id: yearRow.id });
  } catch (error) {
    console.error("Error in POST archive year:", error);
    return NextResponse.json(
      { error: "Failed to create archive year" },
      { status: 500 }
    );
  }
}
