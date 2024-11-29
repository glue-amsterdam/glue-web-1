import { Suspense } from "react";
import MainColorsSection from "@/app/admin/sections/main-colors-sections";
import MainMenuSection from "@/app/admin/sections/main-menu-sections";
import MainLinksSection from "@/app/admin/sections/main-links-sections";
import MainEventsDaysSections from "@/app/admin/sections/main-events-days-sections";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function MainSectionPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Main Section Settings</h1>

      <Suspense fallback={<LoadingSpinner />}>
        <MainEventsDaysSections />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <MainColorsSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <MainMenuSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <MainLinksSection />
      </Suspense>
    </div>
  );
}
