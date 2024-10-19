import { Suspense } from "react";
import ClickAreas from "@/app/click-areas";
import Background from "./components/background";

export default function Home() {
  return (
    <Suspense>
      <main className="fixed inset-0">
        <ClickAreas />
        <Background />
      </main>
    </Suspense>
  );
}
