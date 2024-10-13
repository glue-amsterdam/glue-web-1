import React from "react";
import BackgroundGrid from "../components/background-grid";
import LogoMain from "../components/home-page/logo-main";

function MapPage() {
  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <LogoMain />
      <BackgroundGrid />
    </div>
  );
}

export default MapPage;
