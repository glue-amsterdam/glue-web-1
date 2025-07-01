import { Suspense } from "react";
import MainColorsSection from "@/app/admin/sections/main-colors-sections";
import MainMenuSection from "@/app/admin/sections/main-menu-sections";
import MainLinksSection from "@/app/admin/sections/main-links-sections";
import MainEventsDaysSections from "@/app/admin/sections/main-events-days-sections";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Link from "next/link";
import MainHomeTextSection from "@/app/admin/sections/main-home-text-section";

export default function MainSectionPage() {
  return (
    <div className="space-y-8 container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Main Section Settings</h1>
      <Link href="/admin" className="text-blue-600 hover:underline">
        Back to Admin Dashboard
      </Link>

      <Suspense fallback={<LoadingSpinner />}>
        <MainEventsDaysSections />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <MainHomeTextSection />
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
