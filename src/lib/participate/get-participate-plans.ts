import type { ParticipatePlansPayload } from "@/lib/participate/types";
import { getCachedParticipatePageData } from "@/lib/participate/cached-participate-page-data";

export const getParticipatePlans = async (): Promise<ParticipatePlansPayload> => {
  const data = await getCachedParticipatePageData();
  return {
    applicationClosed: data.applicationClosed,
    closedMessage: data.closedMessage,
    selectablePlans: data.selectablePlans,
  };
};

export { getCachedParticipatePageData } from "@/lib/participate/cached-participate-page-data";
