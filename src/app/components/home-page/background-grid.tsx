"use client";

import { useState } from "react";

function BackgroundGrid({}) {
  const [colors] = useState({
    box1: "#0c0c0c",
    box2: "#072f4a",
    box3: "#0086cd",
    box4: "#7dadc7",
    triangle: "#e1d237",
  });

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
      <div
        style={{ backgroundColor: colors.triangle }}
        className={`triangle`}
      ></div>
      <div style={{ backgroundColor: colors.box1 }} />
      <div style={{ backgroundColor: colors.box2 }} />
      <div style={{ backgroundColor: colors.box3 }} />
      <div style={{ backgroundColor: colors.box4 }} />
    </div>
  );
}

export default BackgroundGrid;
