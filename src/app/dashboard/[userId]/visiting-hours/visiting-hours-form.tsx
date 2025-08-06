"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  visitingHoursDaysSchema,
  VisitingHoursDays,
} from "@/schemas/visitingHoursSchema";
import { PlusIcon, XIcon } from "lucide-react";
import { useEventsDays } from "@/app/context/MainContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Label } from "@/components/ui/label";

interface VisitingHoursFormProps {
  targetUserId: string | undefined;
  initialData?: VisitingHoursDays[] | { error: string } | undefined;
}

export function VisitingHoursForm({
  targetUserId,
  initialData,
}: VisitingHoursFormProps) {
  const isError = initialData && "error" in initialData;
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
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isError && initialData) {
      form.reset({ visitingHours: initialData as VisitingHoursDays[] });
    }
  }, [form, initialData, isError]);

  return (
    <Card className="w-full max-w-[80%] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Visiting Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {eventDays?.length > 0 ? (
              eventDays.map((day, index) => (
                <div key={day.dayId} className="space-y-4">
                  <Label className="font-bold font-overpass">{day.label}</Label>
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
                        {Array.isArray(field.value) &&
                        field.value.length > 0 ? (
                          field.value.map((timeRange, rangeIndex) => (
                            <div
                              key={rangeIndex}
                              className="grid grid-cols-1 md:grid-cols-3 items-center mt-2 gap-2"
                            >
                              <FormControl>
                                <Input
                                  className="w-[70%]"
                                  type="time"
                                  value={timeRange?.open || ""}
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
                                  className="w-[70%]"
                                  type="time"
                                  value={timeRange?.close || ""}
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
                                className="bg-red-500 hover:bg-red-600 text-white size-8 md:size-10 m-2 order-first md:order-last"
                                onClick={() => {
                                  const newValue = [...field.value];
                                  newValue.splice(rangeIndex, 1);
                                  field.onChange(newValue);
                                }}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p>No visiting hours set for this day.</p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            field.onChange([
                              ...(Array.isArray(field.value)
                                ? field.value
                                : []),
                              { open: "09:00", close: "17:00" },
                            ])
                          }
                          className="mt-2"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Time Range
                        </Button>
                      </FormItem>
                    )}
                  />
                </div>
              ))
            ) : (
              <p>No event days available. Please set up event days first.</p>
            )}
            <SaveChangesButton
              watchFields={["visitingHours"]}
              isSubmitting={isSubmitting}
              className="w-full"
            >
              Save Visiting Hours
            </SaveChangesButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
