import { PlanType } from "@/schemas/plansSchema";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePlan(planId: string) {
  const { data, error, isLoading, mutate } = useSWR<PlanType>(
    `/api/admin/plans?plan=${planId}`,
    fetcher
  );

  return {
    plan: data,
    isLoading,
    isError: error,
    mutate,
  };
}
