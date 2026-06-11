"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  visitingHoursDaysSchema,
  VisitingHoursDays,
} from "@/schemas/visitingHoursSchema";
import { PlusIcon, XIcon } from "lucide-react";
import { useEventsDays } from "@/context/MainContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Label } from "@/components/ui/label";
import PlusIconDesktop from "@/components/icons/plus-icon-desktop";
import CrossRotatedDesktop from "@/components/icons/cross-rotated-desktop";

interface VisitingHoursFormProps {
  targetUserId: string | undefined;
  initialData?: VisitingHoursDays[] | { error: string } | undefined;
  embedded?: boolean;
  readOnly?: boolean;
}

export function VisitingHoursForm({
  targetUserId,
  initialData,
  embedded = false,
  readOnly = false,
}: VisitingHoursFormProps) {
  const isError =
    (initialData && "error" in initialData) ||
    !initialData ||
    (Array.isArray(initialData) && initialData.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const eventDays = useEventsDays();

  const form = useForm<{ visitingHours: VisitingHoursDays[] }>({
    resolver: zodResolver(visitingHoursDaysSchema),
    defaultValues: {
      visitingHours:
        isError || !initialData
          ? eventDays?.map((day) => ({
            user_id: targetUserId || "",
            day_id: day.dayId,
            hours: [],
          })) || []
          : (initialData as VisitingHoursDays[]).map((day) => ({
            ...day,
            user_id: targetUserId || day.user_id,
            day_id: day.day_id,
          })),
    },
  });

  const onSubmit = createSubmitHandler<{ visitingHours: VisitingHoursDays[] }>(
    `/api/users/participants/${targetUserId}/hours`,
    async () => {
      toast({
        title: "Success",
        description: "Visiting hours updated successfully.",
      });
      await mutate(`/api/users/participants/${targetUserId}/hours`);
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update visiting hours. Please try again. " + error,
        variant: "destructive",
      });
    },
    isError ? "POST" : "PUT"
  );

  useEffect(() => {
    if (targetUserId) {
      const currentValues = form.getValues().visitingHours;
      form.setValue(
        "visitingHours",
        currentValues.map((day) => ({ ...day, user_id: targetUserId }))
      );
    }
  }, [targetUserId, form]);

  const handleSubmit = async (values: {
    visitingHours: VisitingHoursDays[];
  }) => {
    if (readOnly) return;

    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isError && initialData) {
      form.reset({ visitingHours: initialData as VisitingHoursDays[] });
    }
  }, [form, initialData, isError]);

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="text-(--black-color) py-[15px] lg:py-[30px]">
        {eventDays?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px] lg:gap-[30px] items-start">
            {eventDays.map((day, index) => (
              <div key={day.dayId} className="space-y-2">
                <FormField
                  control={form.control}
                  name={`visitingHours.${index}.hours`}
                  render={({ field }) => (
                    <FormItem>
                      <input
                        type="hidden"
                        {...form.register(`visitingHours.${index}.user_id`)}
                        value={targetUserId || ""}
                      />
                      <input
                        type="hidden"
                        {...form.register(`visitingHours.${index}.day_id`)}
                        value={day.dayId}
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-(--black-color) base-text-size">
                          {day.label}
                        </Label>
                        <Button
                          type="button"
                          disabled={readOnly}
                          aria-label={`Add time range for ${day.label}`}
                          onClick={() =>
                            field.onChange([
                              ...(Array.isArray(field.value)
                                ? field.value
                                : []),
                              { open: "09:00", close: "17:00" },
                            ])
                          }
                          className="p-0 bg-transparent shadow-none hover:bg-transparent cursor-pointer"
                        >
                          <PlusIconDesktop />
                        </Button>
                      </div>
                      {Array.isArray(field.value) &&
                        field.value.map((timeRange, rangeIndex) => (
                          <div
                            key={rangeIndex}
                            className="flex items-center gap-2 flex-wrap"
                          >
                            <FormControl>
                              <Input
                                className="max-w-[100px] base-text-size p-0"
                                type="time"
                                value={timeRange?.open || ""}
                                disabled={readOnly}
                                aria-label={`Open time for ${day.label}`}
                                onChange={(e) => {
                                  const newValue = [...field.value];
                                  newValue[rangeIndex] = {
                                    ...newValue[rangeIndex],
                                    open: e.target.value,
                                  };
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <Input
                                className="max-w-[100px] base-text-size p-0"
                                type="time"
                                value={timeRange?.close || ""}
                                disabled={readOnly}
                                aria-label={`Close time for ${day.label}`}
                                onChange={(e) => {
                                  const newValue = [...field.value];
                                  newValue[rangeIndex] = {
                                    ...newValue[rangeIndex],
                                    close: e.target.value,
                                  };
                                  field.onChange(newValue);
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              size="icon"
                              disabled={readOnly}
                              aria-label={`Remove time range for ${day.label}`}
                              onClick={() => {
                                const newValue = [...field.value];
                                newValue.splice(rangeIndex, 1);
                                field.onChange(newValue);
                              }}
                              className="p-0 bg-transparent shadow-none hover:bg-transparent cursor-pointer"
                            >
                              <CrossRotatedDesktop />
                            </Button>
                          </div>
                        ))}
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No event days available. Please set up event days first.</p>
        )}
        <div className="flex justify-center mini-padding">
          <SaveChangesButton
            label="Save Visiting Hours"
            watchFields={["visitingHours"]}
            isSubmitting={isSubmitting}
            {...(readOnly ? { disabled: true } : {})}
          />
        </div>
      </form>
    </Form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <div className="w-full max-w-[80%] mx-auto space-y-4">
      <h1 className="title-text">Visiting Hours</h1>
      {formContent}
    </div>
  );
}
