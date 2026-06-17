import { config } from "@/config";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

const DASHBOARD_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
};

export type DashboardSubjectProfile = {
  name: string;
  slug: string | null;
};

export const buildDashboardTitle = (
  subjectName: string,
  sectionLabel?: string
): string => {
  const base = `${subjectName} | GLUE dashboard`;
  if (!sectionLabel?.trim()) {
    return base;
  }
  return `${base} | ${sectionLabel.trim()}`;
};

export const getDashboardSubjectName = async (
  targetUserId: string
): Promise<string> => {
  const auth = await getDashboardAuth(targetUserId);

  if (auth.loggedInUserId === targetUserId) {
    return auth.displayName || "User";
  }

  const supabase = await createClient();
  const [targetUserInfoRes, targetParticipantDetailsRes] = await Promise.all([
    supabase
      .from("user_info")
      .select("user_name")
      .eq("user_id", targetUserId)
      .maybeSingle(),
    supabase
      .from("participant_details")
      .select("display_name")
      .eq("user_id", targetUserId)
      .maybeSingle(),
  ]);

  return (
    targetParticipantDetailsRes.data?.display_name ??
    targetUserInfoRes.data?.user_name ??
    "User"
  );
};

export const getDashboardSubjectProfile = async (
  targetUserId: string
): Promise<DashboardSubjectProfile | null> => {
  const auth = await getDashboardAuth(targetUserId);

  if (!auth.isMod) {
    return null;
  }

  const supabase = await createClient();
  const [targetUserInfoRes, targetParticipantDetailsRes] = await Promise.all([
    supabase
      .from("user_info")
      .select("user_name")
      .eq("user_id", targetUserId)
      .maybeSingle(),
    supabase
      .from("participant_details")
      .select("slug, display_name")
      .eq("user_id", targetUserId)
      .maybeSingle(),
  ]);

  const name =
    targetParticipantDetailsRes.data?.display_name ??
    targetUserInfoRes.data?.user_name ??
    null;

  if (!name && !targetParticipantDetailsRes.data?.slug) {
    return { name: targetUserId, slug: null };
  }

  return {
    name: name ?? targetUserId,
    slug: targetParticipantDetailsRes.data?.slug ?? null,
  };
};

type BuildDashboardSectionMetadataOptions = {
  sectionLabel?: string;
  subjectName: string;
  description?: string;
};

export const buildDashboardSectionMetadata = ({
  sectionLabel,
  subjectName,
  description,
}: BuildDashboardSectionMetadataOptions): Metadata => {
  const title = buildDashboardTitle(subjectName, sectionLabel);
  const resolvedDescription =
    description ??
    (sectionLabel
      ? `Manage ${sectionLabel.toLowerCase()} for ${subjectName} in GLUE ${config.cityName}.`
      : `Manage profile settings for ${subjectName} in GLUE ${config.cityName}.`);

  return {
    title,
    description: resolvedDescription,
    robots: DASHBOARD_ROBOTS,
  };
};

export const generateDashboardSectionMetadata = async (
  targetUserId: string,
  sectionLabel: string,
  description?: string
): Promise<Metadata> => {
  const subjectName = await getDashboardSubjectName(targetUserId);
  return buildDashboardSectionMetadata({
    sectionLabel,
    subjectName,
    description,
  });
};

export const generateDashboardBaseMetadata = async (
  targetUserId: string
): Promise<Metadata> => {
  const subjectName = await getDashboardSubjectName(targetUserId);
  return buildDashboardSectionMetadata({ subjectName });
};
