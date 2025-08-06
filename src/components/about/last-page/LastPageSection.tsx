import { GlueInternationalContent } from "@/schemas/internationalSchema";
import { SponsorsSection } from "@/schemas/sponsorsSchema";
import GlueInternationalSection from "./GlueInternationalSection";
import SponsorsCarouselSection from "./SponsorsCarouselSection";

export default function LastPageSection({
  glueInternational,
  sponsorsData,
}: {
  glueInternational: GlueInternationalContent;
  sponsorsData: SponsorsSection;
}) {
  return (
    <section
      id="last"
      aria-labelledby="last-page-heading glue-international sponsors"
      className="min-h-dvh w-full flex flex-col pt-[6rem] pb-[3rem]"
      style={{
        backgroundColor: sponsorsData.sponsorsHeaderSchema.background_color,
      }}
    >
      <div className="z-20 about-w flex flex-col flex-grow justify-around h-full">
        {glueInternational.is_visible && (
          <GlueInternationalSection glueInternational={glueInternational} />
        )}
        {sponsorsData.sponsorsHeaderSchema.is_visible && (
          <SponsorsCarouselSection sponsorsData={sponsorsData} />
        )}
      </div>
    </section>
  );
}
