import StickyParticipantsSection from "@/components/yearly-sections/sticky-participants-section";
import { toStickySectionProps } from "@/lib/yearly-sections/map-yearly-section-props";
import type { HomeStickyGroupData } from "@/lib/home/types";

type Props = {
  data: HomeStickyGroupData;
};

const HomeStickyParticipantsSection = ({ data }: Props) => (
  <StickyParticipantsSection {...toStickySectionProps(data)} />
);

export default HomeStickyParticipantsSection;
