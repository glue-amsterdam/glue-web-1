"use client";

import CuratedMembersForm from "@/app/admin/forms/curated-members-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { CuratedMemberSectionHeader } from "@/schemas/curatedSchema";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutCuratedSection() {
  const {
    data: curatedData,
    error,
    isLoading,
  } = useSWR<CuratedMemberSectionHeader>("/api/admin/about/curated", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load curated header data</div>;
  if (!curatedData) return <div>No curated header data available</div>;

  return <CuratedMembersForm initialData={curatedData} />;
}
