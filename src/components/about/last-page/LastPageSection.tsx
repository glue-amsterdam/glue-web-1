import { SponsorsSection } from "@/schemas/sponsorsSchema";
import SponsorsCarouselSection from "./SponsorsCarouselSection";

export default function LastPageSection({
  sponsorsData,
}: {
  sponsorsData: SponsorsSection;
}) {
  return (
    <section
      id="last"
      aria-labelledby="last-page-heading sponsors"
      className="min-h-dvh w-full flex flex-col pt-[6rem] pb-[3rem]"
    >
      <div className="z-20 about-w flex flex-col flex-grow justify-around h-full">
        {sponsorsData.sponsorsHeaderSchema.is_visible && (
          <SponsorsCarouselSection sponsorsData={sponsorsData} />
        )}
      </div>
    </section>
  );
}
