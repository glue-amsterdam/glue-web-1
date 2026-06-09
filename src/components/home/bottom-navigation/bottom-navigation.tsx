import { cn } from "@/lib/utils";
import type { HomeTextItem } from "@/schemas/mainSchema";

import MainContainer from "../../main-container";
import HomeTextItemDisplay from "./home-text-item";
import SlidingTextArea from "./sliding-text-area";

type BottomNavigationProps = {
  homeTexts: HomeTextItem[];
};

const textStyles =
  "text-[21px] lg:text-[36px] leading-[21px] lg:leading-[36px] font-[400]";

const getTextByPlacement = (
  homeTexts: HomeTextItem[],
  placement: HomeTextItem["placement"]
) => homeTexts.find((item) => item.placement === placement);

const BottomNavigation = ({ homeTexts }: BottomNavigationProps) => {
  const marqueeItems = homeTexts.filter((item) => item.placement === "marquee");
  const footerLeft = getTextByPlacement(homeTexts, "footer_left");
  const footerRight = getTextByPlacement(homeTexts, "footer_right");

  return (
    <aside
      id="bottom-banner"
      aria-label="Event dates and tagline"
      className="fixed bottom-0 right-0 left-0 z-50 bg-(--background-color)"
    >
      <MainContainer>
        <SlidingTextArea marqueeItems={marqueeItems} />
        <div className="flex justify-between items-center h-[65px] border-t border-(--black-color) lg:border-t-2 py-3">
          <h2 className="sr-only">Footer</h2>
          {footerLeft ? (
            <HomeTextItemDisplay
              item={footerLeft}
              className={cn("hidden md:flex", textStyles)}
            />
          ) : (
            <span className="hidden md:flex" aria-hidden="true" />
          )}
          {footerRight ? (
            <HomeTextItemDisplay item={footerRight} className={textStyles} />
          ) : null}
        </div>
      </MainContainer>
    </aside>
  );
};

export default BottomNavigation;
