import CreativeCitizensDisplay from "@/components/home/citizens-of-honour-section/creative-citizens-display";
import type { HomeCitizensData } from "@/lib/home/types";

type Props = {
  data: HomeCitizensData;
};

const CreativeCitizensOfHonour = ({
  data: { title, description, is_visible, citizens },
}: Props) => {
  if (!is_visible) {
    return null;
  }

  return (
    <section id="creative-citizens-of-honour" className="main-padding">
      <h2 className="title-text border-t lg:border-t-2 border-[var(--black-color)] pt-[15px] lg:pt-[30px]">
        {title.toUpperCase()}
      </h2>
      <CreativeCitizensDisplay
        description={description}
        citizens={citizens}
      />
    </section>
  );
};

export default CreativeCitizensOfHonour;
