import { Suspense } from "react";
import Background from "@/app/components/background";
import ClickAreas from "@/app/click-areas";

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
