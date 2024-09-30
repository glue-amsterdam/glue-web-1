import BackgroundGrid from "./components/background-grid";
import LogoMain from "./components/home-page/logo-main";
import ClickAreas from "./components/home-page/main-buttons/click-areas";

export default function Home() {
  return (
    <main className="fixed inset-0">
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
