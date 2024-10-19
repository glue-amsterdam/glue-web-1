import ClickAreasClient from "@/app/components/home-page/click-areas";
import { fetchMainMenu } from "@/utils/api";
import React from "react";

async function ClickAreas() {
  const clickAreas = await fetchMainMenu();
  return <ClickAreasClient clickAreas={clickAreas} />;
}

export default ClickAreas;
