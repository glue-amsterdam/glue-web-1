import { Suspense } from "react";
import BackgroundGrid from "./components/background-grid";
import LogoMain from "./components/home-page/logo-main";
import ClickAreas from "./components/home-page/main-buttons/click-areas";

export default function Home() {
  return (
    <Suspense>
      <main className="fixed inset-0">
        <ClickAreas />
        <BackGround />
      </main>
    </Suspense>
  );
}

function BackGround() {
  return (
    <>
      <LogoMain />
      <BackgroundGrid />
    </>
  );
}
