import { mockRoutes } from "@/lib/mockRoutes";
import { RouteValuesEnhanced } from "@/schemas/mapSchema";

export async function GET() {
  const response: RouteValuesEnhanced[] = mockRoutes;

  if (!response) throw new Error("Failed to fetch routes");

  return new Response(JSON.stringify(response), {
    status: 200,
  });
}
