"use client";

import BackgroundGrid from "./background-grid";
import LogoMain from "./home-page/logo-main";

function Background() {
  return (
    <div className="fixed inset-0">
      <LogoMain mode="home" />
      <BackgroundGrid />
    </div>
  );
}

export default Background;
