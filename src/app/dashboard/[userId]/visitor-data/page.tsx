"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { VisitorDataForm } from "@/app/dashboard/[userId]/visitor-data/visitor-data-form";
import {
  toVisitorProfileFormValues,
  visitorProfileResponseSchema,
} from "@/schemas/visitorSchemas";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const buildVisitorDataUrl = (targetUserId?: string) => {
  const base = "/api/users/visitor-data";
  if (!targetUserId) return base;
  return `${base}?targetUserId=${encodeURIComponent(targetUserId)}`;
};

export default function VisitorDataPage() {
  const { targetUserId, loggedInUserId } = useDashboardContext();
  const apiTargetUserId =
    targetUserId && loggedInUserId && targetUserId !== loggedInUserId
      ? targetUserId
      : undefined;

  const swrKey = buildVisitorDataUrl(apiTargetUserId);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load check-in profile</div>;

  const parsed = visitorProfileResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("visitor-data parse error:", parsed.error.flatten());
    return <div>Could not load check-in profile data</div>;
  }

  const { profile } = parsed.data;
  const formValues = toVisitorProfileFormValues(profile);

  return (
    <VisitorDataForm
      key={`${profile.id}-${apiTargetUserId ?? "self"}`}
      initialProfile={formValues}
      targetUserId={apiTargetUserId}
      permissionsTargetUserId={targetUserId}
      onSaved={() => void mutate()}
    />
  );
}
