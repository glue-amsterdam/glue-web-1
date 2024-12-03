"use client";

import useSWR from "swr";
import MainLinksForm from "@/app/admin/forms/main-links-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MainLinksSection() {
  const {
    data: mainLinks,
    error,
    isLoading,
  } = useSWR("/api/admin/main/links", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load main links: {error.message}</div>;

  return <MainLinksForm initialData={mainLinks} />;
}
