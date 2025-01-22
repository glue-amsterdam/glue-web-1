"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import RegistrationForm from "@/app/signup/RegistrationForm";
import type { PlansArrayType } from "@/schemas/plansSchema";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SignUpPage() {
  const {
    data: plansData,
    error,
    isLoading,
  } = useSWR<PlansArrayType>("/api/plans", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load plans data</div>;
  if (!plansData) return <div>No plans data available</div>;

  return <RegistrationForm plansData={plansData} />;
}
