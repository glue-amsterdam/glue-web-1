"use client";

import useSWR from "swr";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { PressItemsSectionContent } from "@/schemas/pressSchema";
import PressSectionForm from "@/app/admin/forms/about-press-form";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutPressSection() {
  const {
    data: pressItemsSection,
    error,
    isLoading,
  } = useSWR<PressItemsSectionContent>("/api/admin/about/press", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load press section data</div>;
  if (!pressItemsSection) return <div>Failed to load press section data</div>;

  return <PressSectionForm initialData={pressItemsSection} />;
}
