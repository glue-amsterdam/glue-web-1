"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import useSWR from "swr";
import MainHomeTextForm from "@/app/admin/forms/main-home-text-form";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MainHomeTextSection() {
  const {
    data: homeText,
    error,
    isLoading,
  } = useSWR("/api/admin/main/home_text", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load home text</div>;

  return <MainHomeTextForm initialData={homeText} />;
}
