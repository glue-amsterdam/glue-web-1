import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import MainColorsSection from "@/app/admin/sections/main-colors-sections";
import MainMenuSection from "@/app/admin/sections/main-menu-sections";

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function MainSectionPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Main Section Settings</h1>

      <Suspense fallback={<LoadingSpinner />}>
        <MainColorsSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <MainMenuSection />
      </Suspense>

      {/*  <Suspense fallback={<LoadingSpinner />}>
        <MainLinksSection />
      </Suspense> */}
    </div>
  );
}