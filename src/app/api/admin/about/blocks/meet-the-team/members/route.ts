import { requireAdminToken } from "@/lib/admin/require-admin-token";
import { revalidateAboutTeamCache } from "@/lib/about/revalidate-about-cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const memberSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  role: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  description: z.string().optional(),
  display_order: z.number().int().default(0),
});

const membersBodySchema = z.object({
  members: z.array(memberSchema),
});

export async function PUT(request: Request) {
  const auth = await requireAdminToken();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { members } = membersBodySchema.parse(body);

    await auth.supabase
      .from("about_team_members")
      .delete()
      .eq("block_id", "meet-the-team");

    if (members.length > 0) {
      const { error } = await auth.supabase.from("about_team_members").insert(
        members.map((member, index) => ({
          block_id: "meet-the-team",
          name: member.name.trim(),
          role: member.role.trim(),
          email: member.email,
          phone: member.phone ?? null,
          description: member.description ?? null,
          display_order: member.display_order ?? index,
        }))
      );

      if (error) {
        throw error;
      }
    }

    revalidateAboutTeamCache();

    return NextResponse.json({ message: "Team members updated successfully" });
  } catch (error) {
    console.error("Error in PUT team members:", error);
    return NextResponse.json(
      { error: "Failed to update team members" },
      { status: 500 }
    );
  }
}
