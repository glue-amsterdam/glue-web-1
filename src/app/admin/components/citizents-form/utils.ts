import { config } from "@/env";

export const generateAltText = (year: string, name: string) => {
  return `GLUE ${config.cityName} design routes citizen of honour from year ${year} - ${name}`;
};
