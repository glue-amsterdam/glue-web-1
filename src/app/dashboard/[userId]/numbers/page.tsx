import { NumbersClient } from "@/app/dashboard/[userId]/numbers/numbers-client";
import { getDisplayNumbersPanelData } from "@/lib/numbers/get-display-numbers-panel-data";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function NumbersPage({
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

  const data = await getDisplayNumbersPanelData();

  return (
    <NumbersClient targetUserId={userId} rows={data.rows} occupantsByNumber={data.occupantsByNumber} />
  );
}
