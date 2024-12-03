"use client";

import useSWR from "swr";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import InfoSectionForm from "@/app/admin/forms/about-info-form";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutInfoSection() {
  const {
    data: infoItemsSection,
    error,
    isLoading,
  } = useSWR("/api/admin/about/info", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load info section data</div>;

  return <InfoSectionForm initialData={infoItemsSection} />;
}
