import AboutSectionSelector from "@/app/admin/components/about-section-selector";
import AdminHeader from "@/app/admin/components/admin-header";
import AboutCarouselSection from "@/app/admin/sections/about-carousel-sections";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Link from "next/link";
import { Suspense } from "react";

export default async function AboutSectionPage({
  searchParams,
}: {
  searchParams: { section?: string };
}) {
  const searchParamsA = await searchParams;
  const currentSection = searchParamsA.section || "about-carousel";

  return (
    <div className="container mx-auto p-4">
      <AdminHeader adminName="Admin" />
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          About Section
        </h2>
        <AboutSectionSelector currentSection={currentSection} />
        {currentSection === "about-carousel" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutCarouselSection />
          </Suspense>
        )}

        <Link
          href="/admin"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
