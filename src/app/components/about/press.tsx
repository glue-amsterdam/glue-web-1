import PressSection from "@/app/components/about/press-section";
import GlueConectedImage from "@/app/components/glue-connected-image";
import { PressItem } from "@/utils/about-types";
import React from "react";

type Props = {
  pressItems: PressItem[];
  box2Color: string;
};

function Press({ pressItems, box2Color }: Props) {
  return (
    <div
      style={{ backgroundColor: box2Color }}
      className="h-screen snap-start relative "
    >
      <div className="press-bg rotate-180 bg-uiwhite" />
      <GlueConectedImage
        width={250}
        height={100}
        className="absolute bottom-0 right-0 opacity-20 md:opacity-50"
      />

      <PressSection pressItems={pressItems} />
    </div>
  );
}

export default Press;
