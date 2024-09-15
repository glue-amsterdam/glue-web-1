import BackgroundGrid from "./components/background/background-grid";
import LogoMain from "./components/background/logo-main";

export default function Home() {
  return (
    <main className="fixed inset-0 flex justify-center items-center">
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
