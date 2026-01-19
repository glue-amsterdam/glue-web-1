"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminBackHeader from "@/components/admin/AdminBackHeader";
import TermsForm from "./TermsForm";

type TermsData = {
  content: string;
  updated_at?: string;
};

export default function TermsClientPage() {
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch("/api/admin/terms");
        if (!response.ok) {
          throw new Error("Failed to fetch terms and conditions");
        }
        const data = await response.json();
        setTermsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <AdminHeader />
          <AdminBackHeader backLink="/admin" sectionTitle="Terms and Conditions" />
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <AdminHeader />
          <AdminBackHeader backLink="/admin" sectionTitle="Terms and Conditions" />
          <div className="text-red-500 p-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="Terms and Conditions" />
        {termsData && <TermsForm initialData={termsData} />}
      </div>
    </div>
  );
}
