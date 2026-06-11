import { getAdminUserList } from "@/lib/admin/get-admin-user-list";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createAdminClient } from "@/utils/supabase/adminClient";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import UsersAdminClient from "@/app/dashboard/[userId]/users-admin/users-admin-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Users Admin");
}

export default async function UsersAdminPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isModerator = await getIsPlatformMod(supabase, user.id);
  if (!isModerator) {
    notFound();
  }

  const admin = await createAdminClient();
  const users = await getAdminUserList(admin);

  return <UsersAdminClient users={users} key={userId} />;
}
