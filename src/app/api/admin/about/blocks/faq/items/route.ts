import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateAboutBlockCache } from "@/lib/about/revalidate-about-cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const faqItemSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1),
  answer: z.string(),
  display_order: z.number().int().default(0),
});

const itemsBodySchema = z.object({
  items: z.array(faqItemSchema),
});

export async function PUT(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { items } = itemsBodySchema.parse(body);

    await auth.supabase
      .from("about_faq_items")
      .delete()
      .eq("block_id", ABOUT_BLOCK_IDS.FAQ);

    if (items.length > 0) {
      const { error } = await auth.supabase.from("about_faq_items").insert(
        items.map((item, index) => ({
          block_id: ABOUT_BLOCK_IDS.FAQ,
          question: item.question,
          answer: item.answer,
          display_order: item.display_order ?? index,
        }))
      );

      if (error) {
        throw error;
      }
    }

    revalidateAboutBlockCache(ABOUT_BLOCK_IDS.FAQ);

    return NextResponse.json({ message: "FAQ items updated successfully" });
  } catch (error) {
    console.error("Error in PUT FAQ items:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ items" },
      { status: 500 }
    );
  }
}
