"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  visitingHoursSchema,
  VisitingHours,
} from "@/schemas/visitingHoursSchema";
import { PlusIcon, XIcon } from "lucide-react";
import { useEventsDays } from "@/app/context/MainContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { mutate } from "swr";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

interface VisitingHoursFormProps {
  targetUserId: string | undefined;
  initialData?: VisitingHours | { error: string } | undefined;
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
  const form = useForm<VisitingHours>({
    resolver: zodResolver(visitingHoursSchema),
    defaultValues: {
      user_id: targetUserId,
      hours: isError
        ? Object.fromEntries(eventDays.map((day) => [day.dayId, []]))
        : initialData?.hours ||
          Object.fromEntries(eventDays.map((day) => [day.dayId, []])),
    },
  });

  const onSubmit = createSubmitHandler<VisitingHours>(
    `/api/users/participants/${targetUserId}/hours`,
    async () => {
      toast({
        title: "Success",
        description: "visiting hours updated successfully.",
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

  const handleSubmit = async (values: VisitingHours) => {
    setIsSubmitting(true);
    await onSubmit({ ...values, user_id: targetUserId! });
    setIsSubmitting(false);
  };

  useEffect(() => {
    form.reset({ ...(initialData as VisitingHours), user_id: targetUserId });
  }, [form, initialData, targetUserId]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Visiting Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {eventDays.map((day) => (
              <div key={day.dayId} className="space-y-4">
                <h3 className="font-semibold">{day.label}</h3>
                <h2 className="font-light text-xs">
                  {format(new Date(day.date as string), "EEEE, MMMM d, yyyy")}
                </h2>
                <FormField
                  control={form.control}
                  name={`hours.${day.dayId}`}
                  render={({ field }) => (
                    <FormItem>
                      {field.value.map((_, rangeIndex) => (
                        <div
                          key={rangeIndex}
                          className="grid grid-cols-1 md:grid-cols-3 items-center mt-2 gap-2"
                        >
                          <FormControl>
                            <Input
                              className="w-[70%]"
                              type="time"
                              value={field.value[rangeIndex]?.open || ""}
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
                              value={field.value[rangeIndex]?.close || ""}
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
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          field.onChange([
                            ...field.value,
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
            ))}
            <SaveChangesButton
              watchFields={["hours"]}
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
