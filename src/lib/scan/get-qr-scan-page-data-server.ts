import { createClient } from "@/utils/supabase/server";
import { getQrScanPageData } from "@/lib/scan/get-qr-scan-page-data";

export const getQrScanPageDataForUser = async (userId: string) => {
  const supabase = await createClient();
  return getQrScanPageData(supabase, userId);
};
