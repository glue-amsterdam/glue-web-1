"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { PlansArrayType, PlanType } from "@/schemas/plansSchema";
import { useRef, useEffect, useState } from "react";
import PlanCard from "@/app/components/signup/plan-card";
import { ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const planSchema = z.object({
  plan_id: z.string(),
  plan_type: z.enum(["free", "member", "participant"]),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanPickerProps {
  plansData: PlansArrayType;
  onPlanSelected: (plan: PlanType) => void;
  applicationClosed?: boolean;
  closedMessage?: string;
}

export default function PlanPicker({
  plansData,
  onPlanSelected,
  applicationClosed = false,
  closedMessage = "",
}: PlanPickerProps) {
  const { control, handleSubmit, watch, setValue } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      plan_id: plansData.plans[0].plan_id,
      plan_type: plansData.plans[0].plan_type,
    },
  });

  const selectedPlanId = watch("plan_id");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showLeftScrollIndicator, setShowLeftScrollIndicator] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const onSubmit = (data: PlanFormData) => {
    const selectedPlan = plansData.plans.find(
      (plan) => plan.plan_id === data.plan_id
    );
    if (selectedPlan) {
      onPlanSelected(selectedPlan);
    }
  };

  // Initialize card content refs
  useEffect(() => {
    cardContentRefs.current = new Array(plansData.plans.length).fill(null);

    // Detect if device supports touch
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, [plansData.plans.length]);

  // Handle scroll indicator visibility
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollContainer) {
        const scrollPosition = scrollContainer.scrollLeft;
        const scrollWidth = scrollContainer.scrollWidth;
        const clientWidth = scrollContainer.clientWidth;

        // Show right indicator when not at the end
        setShowScrollIndicator(scrollPosition + clientWidth < scrollWidth - 20);

        // Show left indicator when scrolled to the right
        setShowLeftScrollIndicator(scrollPosition > 20);
      }
    };

    // Check initial scroll state
    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Simplified wheel event handling with smart scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (event: WheelEvent) => {
      // Check if we're scrolling inside a card's content
      const target = event.target as Node;
      const cardContent = cardContentRefs.current.find(
        (ref) => ref && ref.contains(target)
      );

      // Calculate scroll intent: prioritize direction with larger delta
      const absDeltaX = Math.abs(event.deltaX);
      const absDeltaY = Math.abs(event.deltaY);
      const isVerticalIntent = absDeltaY > absDeltaX * 1.5; // Vertical scroll is significantly larger
      const isHorizontalIntent = absDeltaX > absDeltaY * 1.5; // Horizontal scroll is significantly larger

      // If we're in a card's content area that can scroll vertically
      if (cardContent) {
        const { scrollHeight, clientHeight } = cardContent;
        const isScrollable = scrollHeight > clientHeight;

        // If the card content is scrollable and user has vertical intent, let it scroll
        if (isScrollable && isVerticalIntent) {
          return; // Let the default scroll behavior happen
        }

        // If user has clear horizontal intent, prioritize carousel scroll
        if (
          isHorizontalIntent &&
          scrollContainer.scrollWidth > scrollContainer.clientWidth
        ) {
          event.preventDefault();
          scrollContainer.scrollBy({
            left: event.deltaX || event.deltaY,
            behavior: "smooth",
          });
          return;
        }
      }

      // If not in card content or no clear vertical intent, handle horizontal scrolling for carousel
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        // Only prevent default if we're not clearly trying to scroll vertically in card content
        if (!cardContent || !isVerticalIntent) {
          event.preventDefault();
          scrollContainer.scrollBy({
            left: event.deltaY,
            behavior: "smooth",
          });
        }
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Handle touch events for better trackpad/touch support
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !isTouchDevice) return;

    let startX: number;
    let scrollLeft: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;

      const x = e.touches[0].pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollContainer.scrollLeft = scrollLeft - walk;

      // Prevent page scrolling when scrolling the container
      if (Math.abs(walk) > 10) {
        e.preventDefault();
      }
    };

    scrollContainer.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    scrollContainer.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isTouchDevice]);

  // Function to scroll right when indicator is clicked
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Adjust as needed
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col pb-4 px-2 h-full`}
    >
      {applicationClosed && (
        <div className="mb-6">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 sr-only">
              Applications Closed
            </AlertTitle>
            <AlertDescription className="text-red-700 whitespace-pre-line text-base">
              {closedMessage ||
                "Applications are currently closed. Please check back later."}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center md:mt-2 md:mb-3 flex-shrink-0">
        Select a Plan
      </h2>
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          height: applicationClosed
            ? "calc(100vh - 4rem - 280px)" // Account for navbar (4rem), alert, header, button, and padding
            : "calc(100vh - 4rem - 200px)", // Account for navbar (4rem), header, button, and padding
        }}
      >
        {showLeftScrollIndicator && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        <div
          ref={scrollContainerRef}
          className="h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory custom-scrollbar"
          style={{
            scrollbarWidth: "auto", // For Firefox - "thick" doesn't exist, use "auto" instead
            msOverflowStyle: "none", // For IE and Edge
          }}
        >
          <div className="flex gap-4 pb-2 h-full px-2 min-w-max">
            <Controller
              name="plan_id"
              control={control}
              render={({ field }) => (
                <>
                  {plansData.plans.map((plan, index) => (
                    <PlanCard
                      key={plan.plan_id}
                      plan={plan}
                      isSelected={selectedPlanId === plan.plan_id}
                      onSelect={() => {
                        field.onChange(plan.plan_id);
                        setValue("plan_type", plan.plan_type);
                      }}
                      contentRef={(el) => {
                        cardContentRefs.current[index] = el;
                      }}
                      index={index}
                    />
                  ))}
                </>
              )}
            />
          </div>
        </div>
        {showScrollIndicator && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        className={`w-full md:w-[80%] mx-auto mt-4 group flex-shrink-0 ${
          selectedPlanId &&
          "bg-[var(--color-box1)] mt-6 text-white py-10 hover:bg-[var(--color-box1)]/50"
        }`}
      >
        <label className="group-hover:scale-110 transition-all md:text-xl pointer-events-none text-pretty h-fit">
          Continue with Selected Plan
        </label>
      </Button>
    </form>
  );
}
