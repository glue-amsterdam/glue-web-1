"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import RegistrationForm from "@/app/signup/RegistrationForm";
import type { PlansArrayType } from "@/schemas/plansSchema";
import useSWR from "swr";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SignUpPage() {
  const { data, error, isLoading } = useSWR("/api/plans", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load plans data</div>;

  // Extract plans array from the response
  const plansData = data?.plans as PlansArrayType;

  // Check if plans exist and are available
  if (!plansData?.plans || plansData.plans.length === 0) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Applications Closed</AlertTitle>
          <AlertDescription>
            Registration is currently closed. Applications will reopen soon.
            Please check back later or contact us for more information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <RegistrationForm plansData={plansData} />;
}
