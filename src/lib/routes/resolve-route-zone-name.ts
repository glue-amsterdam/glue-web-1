type RouteZoneJoin =
  | { name: string }
  | { name: string }[]
  | null
  | undefined;

export const resolveRouteZoneName = (
  routeZones: RouteZoneJoin
): string | null => {
  if (!routeZones) return null;

  const zone = Array.isArray(routeZones) ? routeZones[0] : routeZones;
  return zone?.name ?? null;
};
