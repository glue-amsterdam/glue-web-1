"use client";

import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/userMediaQuery";
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
      className="body-text post-content"
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
    className="group versal-body-text main-boder-top lg:border-0 hover:no-underline py-[15px] lg:pointer-events-none"
  >
    <div className="flex w-full flex-1 flex-col">
      <div className="flex w-full items-start justify-between gap-3">
        <span
          id={`${itemId}-question`}
          className="versal-body-text text-left"
          role="heading"
          aria-level={3}
        >
          {item.question.toUpperCase()}
        </span>
        <span className="lg:hidden">
          <AccordionPlusCrossIcon />
        </span>
      </div>
    </div>
  </AccordionTrigger>
);

const FaqBlockClient = ({ block, sanitized }: Props) => {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const allItemIds = useMemo(
    () => block.items.map((item, index) => getFaqItemId(item, index)),
    [block.items]
  );

  useEffect(() => {
    if (isLargeScreen) {
      setOpenIds(allItemIds);
    }
  }, [isLargeScreen, allItemIds]);

  const handleValueChange = (value: string[]) => {
    if (isLargeScreen) {
      return;
    }
    setOpenIds(value);
  };

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
        className="w-full title-padding lg:grid lg:grid-cols-2 lg:gap-x-[30px] lg:gap-y-[60px]"
        aria-label={block.title}
        value={isLargeScreen ? allItemIds : openIds}
        onValueChange={handleValueChange}
      >
        {block.items.map((item, index) => {
          const itemId = getFaqItemId(item, index);

          return (
            <AccordionItem key={itemId} value={itemId} className="border-b-0">
              <FaqItemTrigger item={item} itemId={itemId} />
              <AccordionContent
                className="pt-[15px]"
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
