"use client";

import { LoadingFallbackMini } from "@/app/components/loading-fallback";
import { useDashboardContext } from "@/app/context/DashboardContext";
import { InvoiceDataForm } from "@/app/dashboard/[userId]/invoice-data/invoice-data-form";

import { InvoiceData } from "@/schemas/invoiceSchemas";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ParticipantDetailsPage() {
  const { isMod, targetUserId } = useDashboardContext();
  const {
    data: invoiceData,
    error,
    isLoading,
  } = useSWR<InvoiceData>(
    `/api/users/participants/${targetUserId}/invoice`,
    fetcher
  );

  if (isLoading) return <LoadingFallbackMini />;
  if (error) return <div>Failed to load invoice data</div>;
  if (!invoiceData) return <div>No invoice data available</div>;
  return (
    <div className="bg-black pt-4 flex-grow">
      <InvoiceDataForm
        initialData={invoiceData}
        isMod={isMod || false}
        targetUserId={targetUserId}
      />
    </div>
  );
}
