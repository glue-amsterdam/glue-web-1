"use client";
import React, { useRef } from "react";
import MapWrapper from "./map-wrapper";
import { MapInfo, Route } from "../hooks/useMapData";
import { useColors } from "../context/MainContext";
import NavBar from "@/components/NavBar";
import { useSetPageDataset } from "@/hooks/useSetPageDataset";

export default function MapClientPage({
  initialData,
}: {
  initialData: {
    mapInfo: MapInfo[];
    routes: Route[];
  };
}) {
  useSetPageDataset("rightButton");
  const { triangle } = useColors();
  const topNavBarRef = useRef<HTMLDivElement>(null);
  return (
    <main
      className="min-h-dvh h-full overflow-x-hidden"
      style={{ backgroundColor: triangle }}
      data-page-container
    >
      <NavBar ref={topNavBarRef} />
      <MapWrapper initialData={initialData} />
    </main>
  );
}
