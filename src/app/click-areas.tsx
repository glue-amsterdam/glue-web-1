import { fetchMainMenu } from "@/utils/api";
import React from "react";
import ClickAreasClient from "./components/home-page/main-buttons/click-areas";

async function ClickAreas() {
  const clickAreas = await fetchMainMenu();
  return <ClickAreasClient clickAreas={clickAreas} />;
}

export default ClickAreas;
