import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { deleteStoredMediaUrls } from "@/lib/admin/delete-stored-media-url";
import {
  revalidateAboutArchiveCache,
  revalidateAboutArchiveYearCache,
  revalidateAboutCitizensYearCache,
  revalidateAboutStickyYearCache,
} from "@/lib/about/revalidate-about-cache";
import { toMediaKey } from "@/lib/media/media-url";
import { NextResponse } from "next/server";
import { z } from "zod";

const yearUpdateSchema = z.object({
  media_type: z.enum(["video", "image"]).nullable().optional(),
  video_src: z.string().optional(),
  video_poster: z.string().optional(),
  video_alt: z.string().optional(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_title: z.string().optional(),
  text_description: z.string().optional(),
});

type ArchiveYearRow = {
  id: string;
  media_type: "video" | "image" | null;
  video_src: string | null;
  video_poster: string | null;
  image_src: string | null;
};

const collectOrphanedMediaUrls = (
  current: ArchiveYearRow,
  validated: z.infer<typeof yearUpdateSchema>
): string[] => {
  const orphaned: string[] = [];
  const nextMediaType = validated.media_type ?? current.media_type;

  if (nextMediaType !== "video") {
    if (current.video_src) {
      orphaned.push(current.video_src);
    }
    if (current.video_poster) {
      orphaned.push(current.video_poster);
    }
  } else {
    if (
      current.video_src &&
      validated.video_src !== undefined &&
      toMediaKey(validated.video_src) !== current.video_src
    ) {
      orphaned.push(current.video_src);
    }
    if (
      current.video_poster &&
      validated.video_poster !== undefined &&
      toMediaKey(validated.video_poster) !== current.video_poster
    ) {
      orphaned.push(current.video_poster);
    }
  }

  if (nextMediaType !== "image") {
    if (current.image_src) {
      orphaned.push(current.image_src);
    }
  } else if (
    current.image_src &&
    validated.image_src !== undefined &&
    toMediaKey(validated.image_src) !== current.image_src
  ) {
    orphaned.push(current.image_src);
  }

  return orphaned;
};

const normalizeMediaField = (
  value: string | undefined
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return value || null;
};

export async function PUT(
  request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { year: yearParam } = await props.params;
  const year = Number(yearParam);

  try {
    const body = await request.json();
    const validated = yearUpdateSchema.parse(body);

    const { data: yearRow, error: findError } = await auth.supabase
      .from("about_archive_years")
      .select("id, media_type, video_src, video_poster, image_src")
      .eq("year", year)
      .single();

    if (findError || !yearRow) {
      return NextResponse.json({ error: "Year not found" }, { status: 404 });
    }

    const orphanedUrls = collectOrphanedMediaUrls(
      yearRow as ArchiveYearRow,
      validated
    );
    await deleteStoredMediaUrls(auth.supabase, orphanedUrls);

    const updatePayload: {
      media_type?: "video" | "image" | null;
      video_src?: string | null;
      video_poster?: string | null;
      video_alt?: string | null;
      image_src?: string | null;
      image_alt?: string | null;
      text_title?: string;
      text_description?: string;
    } = {};

    if (validated.media_type !== undefined) {
      updatePayload.media_type = validated.media_type;
    }
    if (validated.video_src !== undefined) {
      updatePayload.video_src =
        toMediaKey(normalizeMediaField(validated.video_src) ?? undefined) ?? null;
    }
    if (validated.video_poster !== undefined) {
      updatePayload.video_poster =
        toMediaKey(normalizeMediaField(validated.video_poster) ?? undefined) ??
        null;
    }
    if (validated.video_alt !== undefined) {
      updatePayload.video_alt = normalizeMediaField(validated.video_alt) ?? null;
    }
    if (validated.image_src !== undefined) {
      updatePayload.image_src =
        toMediaKey(normalizeMediaField(validated.image_src) ?? undefined) ?? null;
    }
    if (validated.image_alt !== undefined) {
      updatePayload.image_alt = normalizeMediaField(validated.image_alt) ?? null;
    }
    if (validated.text_title !== undefined) {
      updatePayload.text_title = validated.text_title;
    }
    if (validated.text_description !== undefined) {
      updatePayload.text_description = validated.text_description;
    }

    const { error: updateError } = await auth.supabase
      .from("about_archive_years")
      .update(updatePayload)
      .eq("id", yearRow.id);

    if (updateError) {
      throw updateError;
    }

    revalidateAboutArchiveCache();
    revalidateAboutArchiveYearCache(year);
    revalidateAboutCitizensYearCache(year);
    revalidateAboutStickyYearCache(year);

    return NextResponse.json({ message: "Archive year updated" });
  } catch (error) {
    console.error(`Error in PUT archive year ${yearParam}:`, error);
    return NextResponse.json(
      { error: "Failed to update archive year" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ year: string }> }
) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  const { year: yearParam } = await props.params;
  const year = Number(yearParam);

  try {
    const { data: yearRow, error: findError } = await auth.supabase
      .from("about_archive_years")
      .select("video_src, video_poster, image_src")
      .eq("year", year)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (yearRow) {
      await deleteStoredMediaUrls(auth.supabase, [
        yearRow.video_src,
        yearRow.video_poster,
        yearRow.image_src,
      ]);
    }

    const { error } = await auth.supabase
      .from("about_archive_years")
      .delete()
      .eq("year", year);

    if (error) {
      throw error;
    }

    revalidateAboutArchiveCache();
    revalidateAboutArchiveYearCache(year);

    return NextResponse.json({ message: "Archive year deleted" });
  } catch (error) {
    console.error(`Error in DELETE archive year ${yearParam}:`, error);
    return NextResponse.json(
      { error: "Failed to delete archive year" },
      { status: 500 }
    );
  }
}
