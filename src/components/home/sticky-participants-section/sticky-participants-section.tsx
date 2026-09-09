import StickyParticipantsSection from "@/components/yearly-sections/sticky-participants-section";
import { toStickySectionProps } from "@/lib/yearly-sections/map-yearly-section-props";
import type { HomeStickyCtaData, HomeStickyGroupData } from "@/lib/home/types";

type Props = {
  data: HomeStickyGroupData;
  cta: HomeStickyCtaData;
};

const HomeStickyParticipantsSection = ({ data, cta }: Props) => (
  <StickyParticipantsSection
    {...toStickySectionProps(data)}
    buttonLabel={cta.buttonLabel}
    buttonLink={cta.buttonLink}
  />
);

export default HomeStickyParticipantsSection;
