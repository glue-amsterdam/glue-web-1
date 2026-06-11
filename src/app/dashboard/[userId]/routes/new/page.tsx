import { CreateRouteClient } from "@/app/dashboard/[userId]/routes/new/create-route-client";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { getIsPlatformMod } from "@/lib/permissions/get-is-mod";
import { getMapLocationsList } from "@/lib/routes/get-map-locations-list";
import { getRouteZones } from "@/lib/routes/get-route-zones";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Create Route");
}

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
