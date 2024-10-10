import { MainMenu } from "@/utils/menu-types";
import { NextResponse } from "next/server";

export async function GET() {
  const mainMenu: MainMenu[] = [
    {
      label: "dashboard",
      section: "dashboard",
      className: "leftbutton",
    },
    {
      label: "about",
      section: "about",
      className: "upperbutton",
    },
    {
      label: "events",
      section: "events",
      className: "rightbutton",
    },
    {
      label: "map",
      section: "map",
      className: "downbutton",
    },
  ];

  return NextResponse.json(mainMenu);
}
