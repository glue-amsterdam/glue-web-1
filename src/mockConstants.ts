/* Functions */

import { ImageData } from "@/schemas/baseSchema";
import { VisitingHoursType } from "@/schemas/usersSchemas";

export function generateTimestamps() {
  const randomMinutes = Math.floor(Math.random() * 60);
  const baseDate = new Date("2024-10-29T10:30:00Z");
  const createdAt: Date = new Date(baseDate.getTime() + randomMinutes * 60000);
  const updatedAt: Date = new Date(createdAt.getTime() + randomMinutes * 60000);

  return { createdAt, updatedAt };
}
export function getRandomNumber() {
  return Math.floor(Math.random() * 4) + 1;
}

/* Objects */
export const visitingHours: VisitingHoursType = [
  {
    dayId: "day-1",
    date: "2025-01-15T00:00:00Z",
    label: "Thursday",
    ranges: [
      { open: "10:00", close: "15:00" },
      { open: "18:00", close: "21:00" },
    ],
  },
  {
    dayId: "day-2",
    date: "2025-01-16T00:00:00Z",
    label: "Friday",

    ranges: [
      { open: "10:00", close: "15:00" },
      { open: "18:00", close: "21:00" },
    ],
  },
  {
    dayId: "day-3",
    date: "2025-01-17T00:00:00Z",
    label: "Saturday",

    ranges: [
      { open: "10:00", close: "15:00" },
      { open: "18:00", close: "21:00" },
    ],
  },
];

export const placeholderImage: ImageData = {
  image_name:
    "GLUE participant image, the placeholder image until upload their one",
  image_url: "/placeholders/user-placeholder-1.jpg",
  alt: "GLUE participant image, the placeholder image until upload their one",
};
