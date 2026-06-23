import { config } from "@/config";
import { getDashboardAuth } from "@/lib/dashboard/get-dashboard-auth";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import { createAdminClient } from "@/utils/supabase/adminClient";
import type { Metadata } from "next";

const DASHBOARD_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
};

type DashboardSubjectProfile = {
  name: string;
  slug: string | null;
};

const buildDashboardTitle = (
  subjectName: string,
  sectionLabel?: string
): string => {
  const base = `${subjectName} | GLUE dashboard`;
  if (!sectionLabel?.trim()) {
    return base;
  }
  return `${base} | ${sectionLabel.trim()}`;
};

const getDashboardSubjectName = async (
  targetUserId: string
): Promise<string> => {
  const auth = await getDashboardAuth(targetUserId);

  if (auth.loggedInUserId === targetUserId) {
    return auth.displayName || "User";
  }

  const admin = await createAdminClient();
  const [targetParticipantDetailsRes, targetVisitorRes] = await Promise.all([
    admin
      .from("participant_details")
      .select("display_name")
      .eq("user_id", targetUserId)
      .maybeSingle(),
    admin
      .from("visitor_data")
      .select("email, first_name, last_name, display_name, full_name")
      .eq("auth_user_id", targetUserId)
      .maybeSingle(),
  ]);

  return (
    targetParticipantDetailsRes.data?.display_name ??
    getVisitorDisplayName(targetVisitorRes.data ?? {}) ??
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

  const admin = await createAdminClient();
  const [targetParticipantDetailsRes, targetVisitorRes] = await Promise.all([
    admin
      .from("participant_details")
      .select("slug, display_name")
      .eq("user_id", targetUserId)
      .maybeSingle(),
    admin
      .from("visitor_data")
      .select("email, first_name, last_name, display_name, full_name")
      .eq("auth_user_id", targetUserId)
      .maybeSingle(),
  ]);

  const name =
    targetParticipantDetailsRes.data?.display_name ??
    getVisitorDisplayName(targetVisitorRes.data ?? {}) ??
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

const buildDashboardSectionMetadata = ({
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
