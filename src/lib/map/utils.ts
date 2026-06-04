import { config } from "@/config";

export const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const getAddressLine = (formattedAddress: string): string =>
  formattedAddress.split(",")[0]?.trim() ?? formattedAddress;

export const getUserName = (
  userInfo: { user_name: string } | { user_name: string }[]
): string => {
  const info = Array.isArray(userInfo) ? userInfo[0] : userInfo;
  return info?.user_name ?? "Unknown User";
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
