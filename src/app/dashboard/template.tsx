"use client";
import NavBar from "@/components/NavBar";
import { useSetPageDataset } from "@/hooks/useSetPageDataset";
import React from "react";
import { useColors } from "../context/MainContext";

export default function Template({ children }: { children: React.ReactNode }) {
  useSetPageDataset("leftButton");
  const { box3 } = useColors();
  return (
    <>
      <NavBar style={{ backgroundColor: box3 }} />
      <div
        style={{
          backgroundColor: box3,
        }}
        className="min-h-dvh pt-[4rem]"
      >
        {children}
      </div>
    </>
  );
}
