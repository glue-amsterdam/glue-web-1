"use client";

import useSWR from "swr";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import InternationalForm from "@/app/admin/forms/international-form";
import { GlueInternationalContent } from "@/schemas/internationalSchema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutInternationalSection() {
  const {
    data: internacionalData,
    error,
    isLoading,
  } = useSWR<GlueInternationalContent>(
    "/api/admin/about/international",
    fetcher
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load carousel data</div>;
  if (!internacionalData) return <div>No carousel data available</div>;

  return <InternationalForm initialData={internacionalData} />;
}
