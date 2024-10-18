import { Suspense } from "react";
import BackgroundGrid from "@/app/components/background-grid";
import LogoMain from "@/app/components/home-page/logo-main";
import ClickAreas from "@/app/components/home-page/main-buttons/click-areas";
import { fetchMainMenu } from "@/utils/api";

export default async function Home() {
  const clickAreas = await fetchMainMenu();
  return (
    <Suspense>
      <main className="fixed inset-0">
        <ClickAreas clickAreas={clickAreas} />
        <BackGround />
      </main>
    </Suspense>
  );
}

function BackGround() {
  return (
    <>
      <LogoMain mode="home" />
      <BackgroundGrid />
    </>
  );
}
