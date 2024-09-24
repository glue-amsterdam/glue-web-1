import BackgroundGrid from "./components/home-page/background-grid";
import LogoMain from "./components/home-page/logo-main";
import ClickAreas from "./components/home-page/main-buttons/click-areas";

export default function Home() {
  return (
    <main className="fixed inset-0 flex justify-center items-center">
      <ClickAreas />
      <BackGround />
    </main>
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
