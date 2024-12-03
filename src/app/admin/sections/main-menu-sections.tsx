"use client";

import useSWR from "swr";
import MainMenuForm from "@/app/admin/forms/main-menu-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MainMenuSection() {
  const {
    data: mainSectionData,
    error,
    isLoading,
  } = useSWR("/api/admin/main/menu", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load main menu data</div>;

  return <MainMenuForm initialData={mainSectionData} />;
}
