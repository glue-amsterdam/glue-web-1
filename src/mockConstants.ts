import { ImageData } from "@/utils/global-types";
import { VisitingHours } from "@/utils/user-types";

/* Functions */

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
export const visitingHours: VisitingHours = [
  {
    id: "day-1",
    label: "Thursday",
    ranges: [
      { open: "10:00", close: "15:00" },
      { open: "18:00", close: "21:00" },
    ],
  },
  {
    id: "day-2",
    label: "Friday",
    ranges: [
      { open: "10:00", close: "15:00" },
      { open: "18:00", close: "21:00" },
    ],
  },
  {
    id: "day-3",
    label: "Saturday",
    ranges: [
      { open: "10:00", close: "15:00" },
      { open: "18:00", close: "21:00" },
    ],
  },
];

export const placeholderImage: ImageData = {
  id: "mock-image-1",
  imageName:
    "GLUE participant image, the placeholder image until upload their one",
  imageUrl: "/placeholders/user-placeholder-1.jpg",
  alt: "GLUE participant image, the placeholder image until upload their one",
  createdAt: new Date(),
  updatedAt: new Date(),
};
