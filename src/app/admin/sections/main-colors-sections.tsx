"use client";

import MainColorsForm from "@/app/admin/forms/main-colors-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MainColorsSection() {
  const {
    data: mainColors,
    error,
    isLoading,
  } = useSWR("/api/admin/main/colors", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load main colors</div>;

  return <MainColorsForm initialData={mainColors} />;
}
