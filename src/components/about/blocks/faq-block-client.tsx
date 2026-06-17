"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AccordionPlusCrossIcon from "@/components/icons/accordion-plus-cross-icon";
import { ABOUT_ANCHORS, type FaqBlock, type FaqItem } from "@/schemas/aboutPageSchema";

type SanitizedFaqContent = {
  description: string;
  answers: string[];
};

type Props = {
  block: FaqBlock;
  sanitized: SanitizedFaqContent;
};

const getFaqItemId = (item: FaqItem, index: number) =>
  `faq-item-${index}-${item.question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const FaqItemContent = ({ sanitizedAnswer }: { sanitizedAnswer: string }) => {
  if (!sanitizedAnswer) {
    return null;
  }

  return (
    <div
      className="base-text-size"
      dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
    />
  );
};

const FaqItemTrigger = ({
  item,
  itemId,
}: {
  item: FaqItem;
  itemId: string;
}) => (
  <AccordionTrigger
    hideIcon
    className="group base-text-size main-boder-top hover:no-underline py-[15px]"
  >
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full items-start justify-between gap-3">
        <span
          id={`${itemId}-question`}
          className="base-text-size text-left"
          role="heading"
          aria-level={3}
        >
          {item.question.toUpperCase()}
        </span>
        <AccordionPlusCrossIcon />
      </div>
    </div>
  </AccordionTrigger>
);

const FaqBlockClient = ({ block, sanitized }: Props) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  if (!block.is_visible) {
    return null;
  }

  return (
    <section id={ABOUT_ANCHORS.FAQ} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="title-text mini-padding">
        {block.title.toUpperCase()}
      </h2>
      {block.description ? (
        <div
          className="sr-only"
          dangerouslySetInnerHTML={{ __html: sanitized.description }}
        />
      ) : null}
      <Accordion
        type="multiple"
        className="w-full pt-[40px] lg:grid lg:grid-cols-2 lg:gap-x-[30px] lg:gap-y-[60px]"
        aria-label={block.title}
        value={openIds}
        onValueChange={setOpenIds}
      >
        {block.items.map((item, index) => {
          const itemId = getFaqItemId(item, index);

          return (
            <AccordionItem key={itemId} value={itemId} className="border-b-0">
              <FaqItemTrigger item={item} itemId={itemId} />
              <AccordionContent
                className="pt-[30px]"
                aria-labelledby={`${itemId}-question`}
              >
                <FaqItemContent sanitizedAnswer={sanitized.answers[index] ?? ""} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
};

export default FaqBlockClient;
