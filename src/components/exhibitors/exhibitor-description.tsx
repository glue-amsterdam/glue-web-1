"use client";

import BigButton from "@/components/big-button";
import { cn } from "@/lib/utils";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type ExhibitorDescriptionProps = {
  entityName: string;
  descriptionHtml: string;
};

const ExhibitorDescription = ({
  entityName,
  descriptionHtml,
}: ExhibitorDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const descriptionId = `exhibitor-description-${entityName}`;

  useEffect(() => {
    setIsExpanded(false);
  }, [entityName]);

  const handleToggleExpanded = () => {
    setIsExpanded((previous) => !previous);
  };

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }

    const updateShowToggle = () => {
      const collapsedMaxPx = parseFloat(getComputedStyle(element).maxHeight);
      if (!Number.isFinite(collapsedMaxPx)) {
        return;
      }

      setShowToggle(element.scrollHeight > collapsedMaxPx + 1);
    };

    updateShowToggle();

    const resizeObserver = new ResizeObserver(updateShowToggle);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [descriptionHtml, entityName, isExpanded]);

  const descriptionClassName = isExpanded
    ? "overflow-y-auto text-[17px] leading-[23px]"
    : "overflow-hidden max-h-[210px] lg:max-h-[775px]";

  return (
    <div className="pt-[40px] lg:pt-0 pb-[30px]">
      <div
        id={descriptionId}
        ref={contentRef}
        className={cn(descriptionClassName, "base-text-size font-lausanne")}
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />

      {showToggle && (
        <div className="flex justify-center pt-[30px]">
          <BigButton
            label={isExpanded ? "read less" : "read more"}
            onClick={handleToggleExpanded}
            mode="footer"
            as="button"
            fontSize="small"
          />
        </div>
      )}
    </div>
  );
};

export default ExhibitorDescription;
