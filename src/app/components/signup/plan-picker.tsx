"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PlansArrayType, PlanType } from "@/schemas/plansSchema";
import { useRef, useEffect, useState } from "react";

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
          return; // Allow default vertical scrolling
        }
      }

      // Check if horizontal scrolling is possible
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

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
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
      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-x-auto scrollbar-thin scrollbar-track-white scrollbar-thumb-uiblack overflow-y-hidden scrollbar-corner-white snap-x snap-mandatory"
      >
        <div className="flex gap-4 pb-2 h-full px-2 min-w-max">
          <Controller
            name="plan_id"
            control={control}
            render={({ field }) => (
              <>
                {plansData.plans.map((plan, index) => (
                  <Card
                    key={plan.plan_id}
                    className={`w-[60vw] lg:w-[30vw] gap-2 h-full flex flex-col cursor-pointer snap-start ${
                      selectedPlanId === plan.plan_id
                        ? "bg-[var(--color-box1)] text-white"
                        : ""
                    }`}
                    onClick={() => {
                      field.onChange(plan.plan_id);
                      setValue("plan_type", plan.plan_type);
                    }}
                  >
                    <CardHeader className="flex flex-col justify-center p-1">
                      <CardTitle className="text-lg sm:text-xl font-bold tracking-wider">
                        {plan.plan_label}
                      </CardTitle>
                    </CardHeader>
                    <CardDescription
                      className={`px-6 flex items-center
                      ${
                        selectedPlanId === plan.plan_id &&
                        "bg-[var(--color-box1)] text-white"
                      }
                      `}
                    >
                      {plan.currency_logo}
                      {plan.plan_price}
                    </CardDescription>
                    <CardContent className="text-sm pb-1">
                      {plan.plan_description}
                    </CardContent>
                    <CardContent
                      ref={(el) => {
                        cardContentRefs[index] = el;
                      }}
                      className={`flex-grow overflow-y-auto scrollbar-thin px-3
                      ${
                        selectedPlanId === plan.plan_id
                          ? "scrollbar-track-transparent scrollbar-thumb-uiwhite"
                          : "scrollbar-track-white scrollbar-thumb-black"
                      }`}
                    >
                      <ul className="list-disc space-y-1 list-inside text-xs">
                        {plan.plan_items.map((feature, index) => (
                          <li key={feature.label + index}>{feature.label}</li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        type="button"
                        disabled={selectedPlanId === plan.plan_id}
                        className={`w-full rounded-none 
                          ${
                            selectedPlanId === plan.plan_id
                              ? "bg-[var(--color-box1)] text-white"
                              : "bg-white text-black hover:bg-gray/80"
                          }
                          `}
                      >
                        {selectedPlanId === plan.plan_id
                          ? "Selected"
                          : "Select plan"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          />
        </div>
      </div>
      <Button
        type="submit"
        className={`w-full md:w-[80%] mx-auto mt-4 group ${
          selectedPlanId &&
          "bg-[var(--color-box1)] mt-6 text-white py-10 hover:bg-[var(--color-box1)]/50"
        }`}
      >
        <label className="group-hover:scale-110 transition-all md:text-xl ">
          Continue with Selected Plan
        </label>
      </Button>
    </form>
  );
}
