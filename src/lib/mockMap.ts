import { LocationGroup } from "@/utils/map-types";

export const locationGroups: LocationGroup[] = [
  {
    id: "locations",
    title: "Locations",
    protected: false,
    locations: [
      {
        id: 1,
        title: "New York",
        content: "The most populous city in the United States.",
        coordinates: { x: 25, y: 40 },
      },
      {
        id: 2,
        title: "Tokyo",
        content: "The capital and most populous prefecture of Japan.",
        coordinates: { x: 80, y: 35 },
      },
      {
        id: 3,
        title: "London",
        content:
          "The capital and largest city of England and the United Kingdom.",
        coordinates: { x: 45, y: 25 },
      },
    ],
  },
  {
    id: "curated-routes",
    title: "Curated Routes",
    protected: true,
    locations: [
      {
        id: 4,
        title: "Eiffel Tower",
        content: "A wrought-iron lattice tower on the Champ de Mars in Paris.",
        coordinates: { x: 48, y: 30 },
      },
      {
        id: 5,
        title: "Great Wall of China",
        content: "A series of fortifications in northern China.",
        coordinates: { x: 70, y: 20 },
      },
      {
        id: 6,
        title: "Taj Mahal",
        content: "An ivory-white marble mausoleum in Agra, India.",
        coordinates: { x: 65, y: 45 },
      },
    ],
  },
  {
    id: "East & North",
    title: "Natural Wonders",
    protected: true,
    locations: [
      {
        id: 7,
        title: "Grand Canyon",
        content:
          "A steep-sided canyon carved by the Colorado River in Arizona.",
        coordinates: { x: 20, y: 60 },
      },
      {
        id: 8,
        title: "Great Barrier Reef",
        content:
          "The world's largest coral reef system off the coast of Australia.",
        coordinates: { x: 85, y: 75 },
      },
      {
        id: 9,
        title: "Mount Everest",
        content:
          "Earth's highest mountain above sea level, located in the Himalayas.",
        coordinates: { x: 75, y: 40 },
      },
    ],
  },
  {
    id: "centre",
    title: "Centre",
    protected: true,
    locations: [
      {
        id: 7,
        title: "Grand Canyon",
        content:
          "A steep-sided canyon carved by the Colorado River in Arizona.",
        coordinates: { x: 20, y: 60 },
      },
      {
        id: 8,
        title: "Great Barrier Reef",
        content:
          "The world's largest coral reef system off the coast of Australia.",
        coordinates: { x: 85, y: 75 },
      },
      {
        id: 9,
        title: "Mount Everest",
        content:
          "Earth's highest mountain above sea level, located in the Himalayas.",
        coordinates: { x: 75, y: 40 },
      },
    ],
  },
  {
    id: "west",
    title: "West",
    protected: true,
    locations: [
      {
        id: 7,
        title: "Grand Canyon",
        content:
          "A steep-sided canyon carved by the Colorado River in Arizona.",
        coordinates: { x: 20, y: 60 },
      },
      {
        id: 8,
        title: "Great Barrier Reef",
        content:
          "The world's largest coral reef system off the coast of Australia.",
        coordinates: { x: 85, y: 75 },
      },
      {
        id: 9,
        title: "Mount Everest",
        content:
          "Earth's highest mountain above sea level, located in the Himalayas.",
        coordinates: { x: 75, y: 40 },
      },
    ],
  },
];
