"use client";
import NavBar from "@/components/NavBar";
import { NAVBAR_HEIGHT } from "@/constants";
import { useSetPageDataset } from "@/hooks/useSetPageDataset";
import React, { useEffect } from "react";
import { useColors } from "../context/MainContext";

export default function Template({ children }: { children: React.ReactNode }) {
  useSetPageDataset("leftButton");
  const { box3 } = useColors();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div
      style={{ backgroundColor: box3 }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <NavBar style={{ backgroundColor: box3 }} />
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
