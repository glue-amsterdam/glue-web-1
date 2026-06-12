"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  fetchAllYearlyContentYears,
  fetchYearlyContentStatus,
} from "@/lib/admin/fetch-yearly-content-status";
import type { YearlyContentYearStatus } from "@/lib/admin/yearly-content-types";

export type YearlyContentSummaryResult =
  | { years: number[] }
  | { years: number[]; status: YearlyContentYearStatus };

export async function getYearlyContentSummary(
  year?: number
): Promise<YearlyContentSummaryResult> {
  const supabase = await requireAdmin();
  const years = await fetchAllYearlyContentYears(supabase);

  if (year !== undefined) {
    const status = await fetchYearlyContentStatus(supabase, year);
    return { years, status };
  }

  return { years };
}
