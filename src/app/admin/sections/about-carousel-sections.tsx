import { fetchAboutCarousel } from "@/utils/api/admin-api-calls";
import AboutCarouselSectionForm from "@/app/admin/forms/about-carousel-form";

export default async function AboutCarouselSection() {
  console.log("Server: fetching carousel data");

  const carouselData = await fetchAboutCarousel();
  console.log("Server: carouselData fetched");

  return <AboutCarouselSectionForm initialData={carouselData} />;
}
