import { createClient } from "@/utils/supabase/server";
import { getQrScanPageData } from "@/lib/scan/get-qr-scan-page-data";
import { createAdminClient } from "@/utils/supabase/adminClient";

export const getQrScanPageDataForUser = async (userId: string) => {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  return getQrScanPageData(supabase, userId, adminClient);
};
