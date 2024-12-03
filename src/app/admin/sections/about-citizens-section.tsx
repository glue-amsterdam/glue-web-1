"use client";

import useSWR from "swr";
import CitizensForm from "@/app/admin/components/citizents-form/citizens-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutCitizensSection() {
  const { data: citizensData, error: citizensError } = useSWR(
    "/api/admin/about/citizens",
    fetcher
  );
  const { data: years, error: yearsError } = useSWR(
    "/api/admin/about/citizens/years",
    fetcher
  );

  if (citizensError || yearsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!citizensData || !years) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return <CitizensForm initialData={citizensData} years={years} />;
}
