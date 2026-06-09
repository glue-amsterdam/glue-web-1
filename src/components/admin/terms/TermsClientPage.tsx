"use client";

import { useEffect, useState } from "react";
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
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="base-text-size p-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      {termsData && <TermsForm initialData={termsData} />}
    </div>
  );
}
