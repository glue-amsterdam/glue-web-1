"use client";

import SponsorsHeaderForm from "@/app/admin/forms/about-sponsors-header-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SponsorsHeader } from "@/schemas/sponsorsSchema";
import { AlertCircle } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutSponsorsSection() {
  const { data: sponsorsHeaderData, error: sponsorsHeaderError } =
    useSWR<SponsorsHeader>("/api/admin/about/sponsors/header", fetcher);

  /*  const { data: years, error: yearsError } = useSWR(
    "/api/admin/about/citizens/years",
    fetcher => here i should fetch the sponsors data
  ); */

  if (sponsorsHeaderError /* || yearsError */) {
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

  if (!sponsorsHeaderData /* || !years */) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return <SponsorsHeaderForm initialData={sponsorsHeaderData} />;
}
