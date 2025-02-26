"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { PlansArrayType, PlanType } from "@/schemas/plansSchema";
import { useRef, useEffect, useState } from "react";
import PlanCard from "@/app/components/signup/plan-card";
import { ChevronRight } from "lucide-react";

const planSchema = z.object({
  plan_id: z.string(),
  plan_type: z.enum(["free", "member", "participant"]),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanPickerProps {
  plansData: PlansArrayType;
  onPlanSelected: (plan: PlanType) => void;
}

export default function PlanPicker({
  plansData,
  onPlanSelected,
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
  const [cardContentRefs, setCardContentRefs] = useState<
    (HTMLDivElement | null)[]
  >([]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const onSubmit = (data: PlanFormData) => {
    const selectedPlan = plansData.plans.find(
      (plan) => plan.plan_id === data.plan_id
    );
    if (selectedPlan) {
      onPlanSelected(selectedPlan);
    }
  };

  useEffect(() => {
    setCardContentRefs(new Array(plansData.plans.length).fill(null));
  }, [plansData.plans.length]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Node;
      const cardContent = cardContentRefs.find(
        (ref) => ref && ref.contains(target)
      );

      if (cardContent) {
        const { scrollHeight, clientHeight, scrollTop } = cardContent;
        const isScrollable = scrollHeight > clientHeight;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // Added a small tolerance

        if (
          isScrollable &&
          ((event.deltaY > 0 && !isAtBottom) || (event.deltaY < 0 && !isAtTop))
        ) {
          return;
        }
      }

      const canScrollHorizontally =
        scrollContainer.scrollWidth > scrollContainer.clientWidth;

      if (canScrollHorizontally) {
        event.preventDefault();
        const newScrollLeft = scrollContainer.scrollLeft + event.deltaY;
        scrollContainer.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });
      }
    };

    const handleScroll = () => {
      if (scrollContainer) {
        const scrollPosition = scrollContainer.scrollLeft;
        const scrollWidth = scrollContainer.scrollWidth;
        const clientWidth = scrollContainer.clientWidth;
        // Hide scroll indicator when reached the end
        setShowScrollIndicator(scrollPosition + clientWidth < scrollWidth - 10);
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [cardContentRefs]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`main-container flex flex-col pb-4 px-2`}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center md:mt-2 md:mb-3">
        Select a Plan
      </h2>
      <div className="relative flex-grow overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex-grow h-full overflow-x-auto scrollbar-thin scrollbar-track-white scrollbar-thumb-uiblack overflow-y-hidden scrollbar-corner-white snap-x snap-mandatory"
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
                        cardContentRefs[index] = el;
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
          <div className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <Button
        type="submit"
        className={`w-full md:w-[80%] mx-auto mt-4 group ${
          selectedPlanId &&
          "bg-[var(--color-box1)] mt-6 text-white py-10 hover:bg-[var(--color-box1)]/50"
        }`}
      >
        <label className="group-hover:scale-110 transition-all md:text-xl pointer-events-none">
          Continue with Selected Plan
        </label>
      </Button>
    </form>
  );
}
