import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "User Data");
}

export default function UserDataLegacyRedirectPage() {
  return notFound();
}
