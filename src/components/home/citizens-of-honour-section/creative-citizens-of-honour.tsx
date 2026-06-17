import CitizensOfHonourSection from "@/components/yearly-sections/citizens-of-honour-section";
import { toCitizensSectionProps } from "@/lib/yearly-sections/map-yearly-section-props";
import type { HomeCitizensData } from "@/lib/home/types";

type Props = {
  data: HomeCitizensData;
};

const CreativeCitizensOfHonour = ({ data }: Props) => (
  <CitizensOfHonourSection {...toCitizensSectionProps(data)} />
);

export default CreativeCitizensOfHonour;
