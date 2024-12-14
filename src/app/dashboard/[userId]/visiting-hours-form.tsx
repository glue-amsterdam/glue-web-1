"use client";

import React from "react";
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

interface VisitingHoursFormProps {
  participantId: string;
  initialData?: VisitingHours;
  onSubmit: (data: VisitingHours) => Promise<void>;
}

export function VisitingHoursForm({
  participantId,
  initialData,
  onSubmit,
}: VisitingHoursFormProps) {
  const eventDays = useEventsDays();
  const form = useForm<VisitingHours>({
    resolver: zodResolver(visitingHoursSchema),
    defaultValues: initialData || {
      participant_id: participantId,
      hours: Object.fromEntries(eventDays.map((day) => [day.dayId, []])),
    },
  });

  const handleSubmit = async (data: VisitingHours) => {
    await onSubmit(data);
  };

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
                <FormField
                  control={form.control}
                  name={`hours.${day.dayId}`}
                  render={({ field }) => (
                    <FormItem>
                      {field.value.map((_, rangeIndex) => (
                        <div
                          key={rangeIndex}
                          className="flex items-center space-x-4 mt-2"
                        >
                          <FormControl>
                            <Input
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
                            variant="destructive"
                            size="icon"
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
            <Button type="submit" className="w-full">
              Save Visiting Hours
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
