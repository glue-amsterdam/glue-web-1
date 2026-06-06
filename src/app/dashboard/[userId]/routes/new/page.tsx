import { CreateRouteClient } from "@/app/dashboard/[userId]/routes/new/create-route-client";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getMapLocationsList } from "@/lib/routes/get-map-locations-list";
import { getRouteZones } from "@/lib/routes/get-route-zones";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function NewRoutePage({
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

  const [mapInfoList, routeZones] = await Promise.all([
    getMapLocationsList(),
    getRouteZones(),
  ]);

  return (
    <CreateRouteClient
      targetUserId={userId}
      mapInfoList={mapInfoList}
      routeZones={routeZones}
    />
  );
}
