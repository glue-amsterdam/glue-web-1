import { config } from "@/env";
import { Suspense } from "react";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import AboutCarouselForm from "@/components/admin/about/carousel/AboutCarouselForm";
import AboutParticipantsForm from "@/components/admin/about/participants/AboutParticipantsForm";
import AboutCuratedStickyForm from "@/components/admin/about/curated-sticky/AboutCuratedStickyForm";
import AboutCitizensForm from "@/components/admin/about/citizens-of-honour/AboutCitizenForm";
import AboutInfoForm from "@/components/admin/about/info/AboutInfoForm";
import AboutPressForm from "@/components/admin/about/press/AboutPressForm";
import AboutInternationalForm from "@/components/admin/about/international/AboutInternationalForm";
import AboutSponsorsForm from "@/components/admin/about/sponsors/AboutSponsorsForm";
import AdminAboutSelector from "@/components/admin/about/AdminAboutSelector";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminBackHeader from "@/components/admin/AdminBackHeader";

interface AboutPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const fetchAboutCarousel = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/carousel`);
  const data = await res.json();
  return data;
};

const fetchAboutParticipants = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/participants`);
  const data = await res.json();
  return data;
};

const fetchAboutCitizens = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/citizens`);
  const data = await res.json();
  return data;
};

const fetchAboutYears = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/citizens/years`);
  const data = await res.json();
  return data;
};

const fetchAboutCurated = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/curated`);
  const data = await res.json();
  return data;
};

const fetchAboutInfo = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/info`);
  const data = await res.json();
  return data;
};

const fetchAboutPress = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/press`);
  const data = await res.json();
  return data;
};

const fetchAboutInternational = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/international`);
  const data = await res.json();
  return data;
};

export default async function AboutSectionPage({
  searchParams,
}: AboutPageProps) {
  const { section } = await searchParams;
  const currentSection = (section as string) || "about-carousel";

  let sectionData = null;
  let yearsData = null;

  switch (currentSection) {
    case "about-carousel":
      sectionData = await fetchAboutCarousel();
      break;
    case "about-participants":
      sectionData = await fetchAboutParticipants();
      break;
    case "about-citizens":
      sectionData = await fetchAboutCitizens();
      yearsData = await fetchAboutYears();
      break;
    case "about-curated":
      sectionData = await fetchAboutCurated();
      break;
    case "about-info":
      sectionData = await fetchAboutInfo();
      break;
    case "about-press":
      sectionData = await fetchAboutPress();
      break;
    case "about-international":
      sectionData = await fetchAboutInternational();
      break;
    // No fetch for sponsors, handled by Suspense
    default:
      break;
  }

  return (
    <div className="container mx-auto p-4 text-black h-full pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="About Section" />
        <AdminAboutSelector currentSection={currentSection} />
        <div className="">
          {currentSection === "about-carousel" && (
            <AboutCarouselForm initialData={sectionData} />
          )}
          {currentSection === "about-participants" && (
            <AboutParticipantsForm initialData={sectionData} />
          )}
          {currentSection === "about-citizens" && (
            <AboutCitizensForm initialData={sectionData} years={yearsData} />
          )}
          {currentSection === "about-curated" && (
            <AboutCuratedStickyForm initialData={sectionData} />
          )}
          {currentSection === "about-info" && (
            <AboutInfoForm initialData={sectionData} />
          )}
          {currentSection === "about-press" && (
            <AboutPressForm initialData={sectionData} />
          )}
          {currentSection === "about-international" && (
            <AboutInternationalForm initialData={sectionData} />
          )}
          {currentSection === "about-sponsors" && (
            <Suspense fallback={<LoadingSpinner />}>
              <AboutSponsorsForm />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
