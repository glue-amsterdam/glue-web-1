import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { config } from "@/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAltText = (year: string, name: string) => {
  return `GLUE ${config.cityName} design routes citizen of honour from year ${year} - ${name}`;
};
