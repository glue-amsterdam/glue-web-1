import { MapInfoClient } from "@/app/dashboard/[userId]/map-info/map-info-client";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Map Information");
}

export default async function MapInfoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { isMod } = await getDashboardAuth(userId);

  return <MapInfoClient targetUserId={userId} isMod={isMod} />;
}
