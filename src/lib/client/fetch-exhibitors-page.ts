import { BASE_URL } from "@/constants";
import type {
  ExhibitorsPageResponse,
  ExhibitorsQueryParams,
} from "@/lib/participants/exhibitor-types";
import { buildExhibitorsSearchParams } from "@/lib/participants/exhibitors-url";

export const fetchExhibitorsPageClient = async (
  params: ExhibitorsQueryParams
): Promise<ExhibitorsPageResponse> => {
  const searchParams = buildExhibitorsSearchParams(params);
  const url = `${BASE_URL}/participants?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody && typeof errorBody.error === "string"
        ? errorBody.error
        : "Failed to fetch exhibitors";
    throw new Error(message);
  }

  return response.json();
};
