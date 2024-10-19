import GlueInternational from "@/app/components/about/glue-international";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";
import { GlueInternationalContent, Sponsor } from "@/utils/about-types";
import React from "react";

type Props = {
  glueInternational: GlueInternationalContent;
  sponsors: Sponsor[];
};

function LastPage({ glueInternational, sponsors }: Props) {
  return (
    <div className="h-screen snap-start bg-uiwhite">
      <section className="section-container">
        <div className="screen-size">
          <div className="flex flex-col justify-around h-full">
            <GlueInternational glueInternational={glueInternational} />
            <SponsorsCarousel sponsors={sponsors} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default LastPage;
