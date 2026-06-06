import { notFound, redirect } from "next/navigation";
import { EditRouteForm } from "@/app/dashboard/[userId]/routes/[routeId]/edit-route-form";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getRouteById } from "@/lib/routes/get-route-by-id";
import { getMapLocationsList } from "@/lib/routes/get-map-locations-list";
import { getRouteZones } from "@/lib/routes/get-route-zones";
import { createClient } from "@/utils/supabase/server";

export default async function EditRoutePage({
  params,
}: {
  params: Promise<{ userId: string; routeId: string }>;
}) {
  const { userId, routeId } = await params;

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

  const [route, mapInfoList, routeZones] = await Promise.all([
    getRouteById(routeId),
    getMapLocationsList(),
    getRouteZones(),
  ]);

  if (!route) {
    notFound();
  }

  return (
    <EditRouteForm
      route={route}
      targetUserId={userId}
      mapInfoList={mapInfoList}
      routeZones={routeZones}
    />
  );
}
