"use client";

import Separator from "@/components/separator";
import { cn } from "@/lib/utils";
import {
  ABOUT_ANCHORS,
  ABOUT_BLOCK_IDS,
  type TextDualBlock,
} from "@/schemas/aboutPageSchema";
import AboutBlockImage from "./about-block-image";

const ANCHOR_BY_ID: Record<string, string> = {
  [ABOUT_BLOCK_IDS.FOUNDATION]: ABOUT_ANCHORS.FOUNDATION,
  [ABOUT_BLOCK_IDS.MISSION]: ABOUT_ANCHORS.MISSION,
  [ABOUT_BLOCK_IDS.PRESS]: ABOUT_ANCHORS.PRESS,
};

type SanitizedTextDualContent = {
  description: string;
  textBlock1: string;
  textBlock2: string;
};

type Props = {
  block: TextDualBlock;
  sanitized: SanitizedTextDualContent;
  flex?: boolean;
  grid?: boolean;
  maxWidth?: string;
};

const TextDualBlockClient = ({
  block,
  sanitized,
  flex = false,
  grid = false,
  maxWidth = "723px",
}: Props) => {
  if (!block.is_visible) {
    return null;
  }

  const anchor = ANCHOR_BY_ID[block.id] ?? block.id;
  const headingId = `${anchor}-heading`;

  return (
    <section id={anchor} aria-labelledby={headingId}>
      <h2 id={headingId} className="mini-padding title-text">
        {block.title.toUpperCase()}
      </h2>
      {block.description ? (
        <div
          className="sr-only"
          dangerouslySetInnerHTML={{ __html: sanitized.description }}
        />
      ) : null}
      <div className="pt-[40px] max-w-[1045px] mx-auto">
        <AboutBlockImage
          src={block.media.image.src}
          alt={block.media.image.alt}
          fallbackAlt={block.title}
          className="max-w-[723px] pt-[40px] lg:max-w-[1045px] max-h-[360px] lg:max-h-[674px]"
        />
        <div
          className={cn(
            "pt-[40px] base-text-size",
            flex && "lg:flex lg:gap-[40px]",
            grid && "lg:grid lg:grid-cols-2 lg:gap-[30px]"
          )}
        >
          {block.text_block_1 ? (
            <div
              className={cn(flex && `max-w-[${maxWidth}] w-full`)}
              dangerouslySetInnerHTML={{ __html: sanitized.textBlock1 }}
            />
          ) : null}
          {block.text_block_2 ? (
            <div
              className="pt-[40px] lg:pt-0"
              dangerouslySetInnerHTML={{ __html: sanitized.textBlock2 }}
            />
          ) : null}
        </div>
      </div>
      <Separator />
    </section>
  );
};

export default TextDualBlockClient;
