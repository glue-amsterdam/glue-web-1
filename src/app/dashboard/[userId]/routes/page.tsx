import { RoutesClient } from "@/app/dashboard/[userId]/routes/routes-client";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getRouteZones } from "@/lib/routes/get-route-zones";
import { getRoutesSummary } from "@/lib/routes/get-routes-summary";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function RoutesPage({
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

  const [routes, zones] = await Promise.all([
    getRoutesSummary(),
    getRouteZones(),
  ]);

  return (
    <RoutesClient targetUserId={userId} routes={routes} zones={zones} />
  );
}
