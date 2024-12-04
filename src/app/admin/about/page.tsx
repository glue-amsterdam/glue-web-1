import AboutSectionSelector from "@/app/admin/components/about-section-selector";
import AdminHeader from "@/app/admin/components/admin-header";
import AboutCarouselSection from "@/app/admin/sections/about-carousel-sections";
import AboutCitizensSection from "@/app/admin/sections/about-citizens-section";
import AboutCuratedSection from "@/app/admin/sections/about-curated-sections";
import AboutInfoSection from "@/app/admin/sections/about-info-sections";
import AboutInternationalSection from "@/app/admin/sections/about-international-sections";
import AboutParticipantsSection from "@/app/admin/sections/about-participants-sections";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Link from "next/link";
import { Suspense } from "react";

interface AboutPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AboutSectionPage({
  searchParams,
}: AboutPageProps) {
  const { section } = await searchParams;
  const currentSection = (section as string) || "about-carousel";

  return (
    <div className="container mx-auto p-4">
      <AdminHeader adminName="Admin" />
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Admin Dashboard
        </Link>
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">
          About Section
        </h2>
        <AboutSectionSelector currentSection={currentSection} />
        {currentSection === "about-carousel" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutCarouselSection />
          </Suspense>
        )}
        {currentSection === "about-participants" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutParticipantsSection />
          </Suspense>
        )}
        {currentSection === "about-citizens" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutCitizensSection />
          </Suspense>
        )}
        {currentSection === "about-curated" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutCuratedSection />
          </Suspense>
        )}
        {currentSection === "about-info" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutInfoSection />
          </Suspense>
        )}
        {currentSection === "about-international" && (
          <Suspense fallback={<LoadingSpinner />}>
            <AboutInternationalSection />
          </Suspense>
        )}
      </div>
    </div>
  );
}
