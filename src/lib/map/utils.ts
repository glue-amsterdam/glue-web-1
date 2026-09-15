import { config } from "@/config";

export const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const getAddressLine = (
  formattedAddress: string | null | undefined
): string => {
  if (!formattedAddress) return "";
  return formattedAddress.split(",")[0]?.trim() ?? formattedAddress;
};

export const normalizeMapAddressLine = (
  addressLine: string | null | undefined
): string => {
  if (!addressLine) return "";
  return addressLine.toLowerCase().replace(/\s+/g, " ").trim();
};

type GoogleMapsSearchLocation = {
  latitude: number;
  longitude: number;
  addressLine: string;
};

export const buildGoogleMapsSearchUrl = ({
  latitude,
  longitude,
  addressLine,
}: GoogleMapsSearchLocation): string => {
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  const query = [addressLine.trim(), config.cityName.trim()]
    .filter((part) => part.length > 0)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

type GoogleMapsDirectionsStop = {
  latitude: number;
  longitude: number;
};

export const buildGoogleMapsDirectionsUrl = (
  stops: GoogleMapsDirectionsStop[]
): string | null => {
  if (stops.length === 0) return null;

  const origin = `${stops[0].latitude},${stops[0].longitude}`;
  const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
  const waypoints = stops
    .slice(1, -1)
    .map((stop) => `${stop.latitude},${stop.longitude}`)
    .join("|");

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
};

export const openRouteInGoogleMaps = (route: {
  dots: GoogleMapsDirectionsStop[];
}): void => {
  const url = buildGoogleMapsDirectionsUrl(route.dots);
  if (!url) return;
  window.open(url, "_blank");
};

