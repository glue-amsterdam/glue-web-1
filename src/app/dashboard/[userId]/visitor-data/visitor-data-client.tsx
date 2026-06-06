"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import { VisitorDataForm } from "@/app/dashboard/[userId]/visitor-data/visitor-data-form";
import {
  toVisitorProfileFormValues,
  visitorProfileResponseSchema,
} from "@/schemas/visitorSchemas";
import useSWR from "swr";
import { z } from "zod";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const buildVisitorDataUrl = (targetUserId?: string) => {
  const base = "/api/users/visitor-data";
  if (!targetUserId) return base;
  return `${base}?targetUserId=${encodeURIComponent(targetUserId)}`;
};

const visitorAreasResponseSchema = z.object({
  areas: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});

type VisitorDataClientProps = {
  targetUserId: string;
  loggedInUserId: string;
  isMod: boolean;
};

export const VisitorDataClient = ({
  targetUserId,
  loggedInUserId,
  isMod,
}: VisitorDataClientProps) => {
  const apiTargetUserId =
    targetUserId !== loggedInUserId ? targetUserId : undefined;

  const swrKey = buildVisitorDataUrl(apiTargetUserId);
  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher);
  const {
    data: areasData,
    error: areasError,
    isLoading: areasLoading,
  } = useSWR("/api/visitor-areas", fetcher);

  if (isLoading || areasLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load check-in profile</div>;
  if (areasError) return <div>Failed to load work areas</div>;

  const parsed = visitorProfileResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("visitor-data parse error:", parsed.error.flatten());
    return <div>Could not load check-in profile data</div>;
  }

  const parsedAreas = visitorAreasResponseSchema.safeParse(areasData);
  if (!parsedAreas.success) {
    console.error("visitor-areas parse error:", parsedAreas.error.flatten());
    return <div>Could not load work areas</div>;
  }

  const { profile } = parsed.data;
  const formValues = toVisitorProfileFormValues(profile);
  const subjectDisplayName =
    apiTargetUserId && profile.displayName?.trim()
      ? profile.displayName.trim()
      : null;

  return (
    <VisitorDataForm
      key={`${profile.id}-${apiTargetUserId ?? "self"}`}
      initialProfile={formValues}
      workAreas={parsedAreas.data.areas}
      targetUserId={apiTargetUserId}
      permissionsTargetUserId={targetUserId}
      isMod={isMod}
      subjectDisplayName={subjectDisplayName}
      onSaved={() => void mutate()}
    />
  );
};
