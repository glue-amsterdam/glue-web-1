import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { getProgramDetail } from "./get-program-detail";
import type { ProgramDetail } from "./program-types";

export const fetchProgramDetail = cache(
  async (eventId: string): Promise<ProgramDetail> => {
    const supabase = await createClient();
    return getProgramDetail(supabase, eventId);
  }
);
