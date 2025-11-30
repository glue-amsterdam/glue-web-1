"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlanType } from "@/schemas/plansSchema";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface PlanCardProps {
  plan: PlanType;
  isSelected: boolean;
  onSelect: () => void;
  contentRef: (el: HTMLDivElement | null) => void;
  index: number;
}

const PlanCard = forwardRef<HTMLDivElement, PlanCardProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ plan, isSelected, onSelect, contentRef }, ref) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isContentScrollable, setIsContentScrollable] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const contentElementRef = useRef<HTMLDivElement | null>(null);

    const isLongDescription = plan.plan_description.length > 100;

    const displayDescription =
      isLongDescription && !isDescriptionExpanded
        ? `${plan.plan_description.substring(0, 100)}...`
        : plan.plan_description;

    // Check if content is scrollable and detect mobile
    useEffect(() => {
      const checkScrollable = () => {
        if (contentElementRef.current) {
          const { scrollHeight, clientHeight } = contentElementRef.current;
          setIsContentScrollable(scrollHeight > clientHeight);
        }
      };

      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768); // md breakpoint
      };

      checkMobile();
      checkScrollable();

      // Use ResizeObserver to detect when content size changes
      const resizeObserver = new ResizeObserver(() => {
        checkScrollable();
      });

      if (contentElementRef.current) {
        resizeObserver.observe(contentElementRef.current);
      }

      window.addEventListener("resize", () => {
        checkMobile();
        checkScrollable();
      });

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", checkMobile);
      };
    }, [plan.plan_items]);

    // Combined ref callback
    const handleContentRef = (el: HTMLDivElement | null) => {
      contentElementRef.current = el;
      contentRef(el);
    };

    return (
      <Card
        className={`w-[80vw] sm:w-[60vw] lg:w-[30vw] overflow-hidden h-full flex flex-col cursor-pointer snap-start ${
          isSelected ? "bg-[var(--color-box1)] text-white" : "bg-white"
        }`}
        onClick={onSelect}
      >
        <CardHeader className="flex flex-col justify-center p-4 space-y-2">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-wider text-center">
            {plan.plan_label}
          </CardTitle>
          <CardDescription
            className={`text-2xl sm:text-3xl font-bold flex items-center justify-center
            ${isSelected ? "text-white" : "text-black"}
            `}
          >
            <span className="text-lg mr-1">{plan.currency_logo}</span>
            {plan.plan_price}
          </CardDescription>
        </CardHeader>
        <div className="w-full h-px bg-gray-200" />
        <CardContent className="text-sm p-4">
          <div className="relative">
            <p className={`${isSelected ? "text-white" : "text-gray-600"}`}>
              {displayDescription}
            </p>
            {isLongDescription && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`mt-2 h-6 px-2 text-xs ${
                  isSelected
                    ? "text-white hover:text-black"
                    : "text-primary hover:text-primary/80"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
              >
                {isDescriptionExpanded ? (
                  <span className="flex items-center">
                    See less <ChevronUp className="ml-1 h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    See more <ChevronDown className="ml-1 h-3 w-3" />
                  </span>
                )}
              </Button>
            )}
          </div>
        </CardContent>
        <div className="w-full h-px bg-gray-200" />
        <CardContent
          ref={handleContentRef}
          className={`flex-grow overflow-x-hidden overflow-y-auto scrollbar-thin p-4 relative
          ${
            isSelected
              ? "scrollbar-track-transparent scrollbar-thumb-white"
              : "scrollbar-track-white scrollbar-thumb-gray-400"
          }`}
        >
          <ul
            className={`space-y-2 ${
              isMobile && isContentScrollable ? "pb-8" : ""
            }`}
          >
            {plan.plan_items.map((feature, idx) => (
              <li key={feature.label + idx} className="flex items-start">
                <Check
                  className={`mr-2 h-5 w-5 flex-shrink-0 ${
                    isSelected ? "text-white" : "text-green-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isSelected ? "text-white" : "text-gray-600"
                  }`}
                >
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
          {isMobile && isContentScrollable && (
            <div
              className={`absolute bottom-0 left-0 right-0 text-center py-2 text-xs ${
                isSelected
                  ? "text-white/70 bg-[var(--color-box1)]/80"
                  : "text-gray-500 bg-white/80"
              }`}
            >
              Scroll for more
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4">
          <Button
            type="button"
            disabled={isSelected}
            className={`w-full rounded-full py-2 text-sm font-semibold
              ${
                isSelected
                  ? "bg-white text-[var(--color-box1)]"
                  : "bg-[var(--color-box1)] text-white hover:bg-[var(--color-box1)]/90"
              }
              `}
          >
            {isSelected ? "Selected" : "Select plan"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

PlanCard.displayName = "PlanCard";

export default PlanCard;
