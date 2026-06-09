import { config } from "@/config";

import AboutCarouselForm from "@/components/admin/about/carousel/AboutCarouselForm";

const fetchAboutCarousel = async () => {
  const res = await fetch(`${config.baseApiUrl}/admin/about/carousel`);
  const data = await res.json();
  return data;
};

export default async function CarouselAdminPage() {
  const carouselData = await fetchAboutCarousel();

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div
        className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 base-text-size text-amber-900"
        role="status"
      >
        Deprecated — this carousel was used on the legacy About page (about-0.1)
        and is no longer part of the live site.
      </div>
      <AboutCarouselForm initialData={carouselData} />
    </div>
  );
}
