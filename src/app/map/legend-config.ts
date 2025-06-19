import {
  MapPin,
  MapPinIcon as MapPinHouse,
  MapPinIcon as MapPinMinusInside,
  MapPinIcon as MapPinPlus,
} from "lucide-react";

export interface LegendItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
}

// Customize your legend items here
export const legendItems: LegendItem[] = [
  {
    id: "participant",
    icon: MapPin,
    color: "bg-blue-500",
    title: "Participant",
    description: "own location",
  },
  {
    id: "collective",
    icon: MapPinPlus,
    color: "bg-yellow-500",
    title: "Collective",
    description: "up to 3 participants exhibiting in the same location",
  },
  {
    id: "hub",
    icon: MapPinHouse,
    color: "bg-green-500",
    title: "HUB",
    description: "more than 4 participants exhibiting in the same location",
  },
  {
    id: "special-program",
    icon: MapPinMinusInside,
    color: "bg-purple-500",
    title: "Special Program",
    description: "",
  },
];

// You can also customize the legend title
export const legendTitle = "Legend";

// And the legend position (optional)
export const legendPosition = {
  top: "top-4",
  right: "right-16",
};
