import {
  MapPin,
  MapPinIcon as MapPinHouse,
  MapPinIcon as MapPinMinusInside,
} from "lucide-react";

export interface LegendItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
}

// Centralized color configuration
export const markerColors = {
  hub: {
    background: "bg-[#26479e]",
    text: "text-white",
    backgroundLight: "bg-[#26479e]/10",
    hex: "#26479e",
  },
  participant: {
    background: "bg-[#f9a772]",
    text: "text-black",
    backgroundLight: "bg-[#f9a772]/10",
    hex: "#f9a772",
  },
  specialProgram: {
    background: "bg-[#8a8dc5]",
    text: "text-white",
    backgroundLight: "bg-[#8a8dc5]/10",
    hex: "#8a8dc5",
  },
  route: {
    background: "bg-red-500",
    text: "text-white",
    hex: "#ef4444",
  },
} as const;

// Customize your legend items here
export const legendItems: LegendItem[] = [
  {
    id: "hub",
    icon: MapPinHouse,
    color: "bg-[#26479e]",
    title: "GLUE HUB",
    description: "3 or more partitipants in one location",
  },
  {
    id: "participant",
    icon: MapPin,
    color: "bg-[#f9a772]",
    title: "Up to 3 GLUE participants",
    description: "",
  },
  {
    id: "special-program",
    icon: MapPinMinusInside,
    color: "bg-[#8a8dc5]",
    title: "Special Program",
    description: "",
  },
];

export const legendTitle = "Legend";
