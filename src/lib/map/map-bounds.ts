import { config } from "@/config";

export const MAP_CITY_BOUNDS: [number, number, number, number] = [
  Number.parseFloat(config.cityBoundWest || "0"),
  Number.parseFloat(config.cityBoundSouth || "0"),
  Number.parseFloat(config.cityBoundEast || "0"),
  Number.parseFloat(config.cityBoundNorth || "0"),
];

export const MAP_CITY_CENTER: [number, number] = [
  Number.parseFloat(config.cityCenterLng || "0"),
  Number.parseFloat(config.cityCenterLat || "0"),
];
