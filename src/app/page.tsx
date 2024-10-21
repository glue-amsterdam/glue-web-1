import Background from "@/app/components/background";
import ClickAreas from "@/app/components/home-page/click-areas";

export default function Home() {
  return (
    <main className="fixed inset-0">
      <ClickAreas />
      <Background />
    </main>
  );
}
