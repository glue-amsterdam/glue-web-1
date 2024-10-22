import GlueInternational from "@/app/components/about/glue-international";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";
import ScrollUp from "@/app/components/scroll-up";
import { GlueInternationalContent, Sponsor } from "@/utils/about-types";
import React from "react";

type Props = {
  glueInternational: GlueInternationalContent;
  sponsors: Sponsor[];
};

function LastPage({ glueInternational, sponsors }: Props) {
  return (
    <div className="h-screen snap-start bg-uiwhite">
      <section id="last" className="section-container">
        <div className="screen-size">
          <div className="flex flex-col justify-around h-full">
            <GlueInternational glueInternational={glueInternational} />
            <SponsorsCarousel sponsors={sponsors} />
          </div>
        </div>
        <ScrollUp color="uiblack" href="#main" />
      </section>
    </div>
  );
}

export default LastPage;
