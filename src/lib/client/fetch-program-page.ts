import { BASE_URL } from "@/constants";
import type {
  ProgramPageResponse,
  ProgramQueryParams,
} from "@/lib/program/program-types";
import { buildProgramSearchParams } from "@/lib/program/program-url";

export const fetchProgramPageClient = async (
  params: ProgramQueryParams
): Promise<ProgramPageResponse> => {
  const searchParams = buildProgramSearchParams(params);
  const url = `${BASE_URL}/program?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody && typeof errorBody.error === "string"
        ? errorBody.error
        : "Failed to fetch program events";
    throw new Error(message);
  }

  return response.json();
};
