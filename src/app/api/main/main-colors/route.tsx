import { MainColors } from "@/utils/menu-types";
import { NextResponse } from "next/server";

export async function GET() {
  const mainColors: MainColors = {
    box1: "#0c0c0c",
    box2: "#072f4a",
    box3: "#0086cd",
    box4: "#7dadc7",
    triangle: "#e1d237",
  };

  return NextResponse.json(mainColors);
}
