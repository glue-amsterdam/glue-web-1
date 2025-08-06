import { useColors } from "@/app/context/MainContext";
import React from "react";

export default function HomeBackground({
  triangle,
  box1,
  box2,
  box3,
  box4,
}: {
  triangle: React.RefObject<HTMLDivElement>;
  box1: React.RefObject<HTMLDivElement>;
  box2: React.RefObject<HTMLDivElement>;
  box3: React.RefObject<HTMLDivElement>;
  box4: React.RefObject<HTMLDivElement>;
}) {
  const mainColors = useColors();
  return (
    <div className={`grid grid-cols-2 grid-rows-2 h-full w-full`}>
      <div
        ref={triangle}
        id="triangle"
        style={{ backgroundColor: mainColors?.triangle, zIndex: 10 }}
        className={`triangle`}
      />

      <div
        ref={box1}
        id="box1"
        style={{ backgroundColor: mainColors?.box1 }}
        className="grid-area h-[100vh] -translate-y-10 -z-10"
      />
      <div
        ref={box2}
        id="box2"
        style={{ backgroundColor: mainColors?.box2 }}
        className="grid-area h-[100vh] -translate-y-10 -z-10"
      />
      <div
        ref={box3}
        id="box3"
        style={{ backgroundColor: mainColors?.box3 }}
        className="grid-area"
      />
      <div
        ref={box4}
        id="box4"
        style={{ backgroundColor: mainColors?.box4 }}
        className="grid-area"
      />
    </div>
  );
}
