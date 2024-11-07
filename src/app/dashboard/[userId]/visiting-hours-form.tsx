"use client";

import React, { useEffect } from "react";
import { Control, Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { visitingHoursSchema } from "@/schemas/usersSchemas";
import { useEventsDays } from "@/app/context/MainContext";
import { XIcon } from "lucide-react";

export type VisitingHoursType = z.infer<typeof visitingHoursSchema>;

interface VisitingHoursFormProps {
  value: VisitingHoursType;
  onChange: (value: VisitingHoursType) => void;
}

export default function VisitingHoursForm({
  value,
  onChange,
}: VisitingHoursFormProps) {
  const eventDays = useEventsDays();
  const {
    control,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<{ visitingHours: VisitingHoursType }>({
    resolver: zodResolver(z.object({ visitingHours: visitingHoursSchema })),
    defaultValues: { visitingHours: value },
  });

  useEffect(() => {
    reset({ visitingHours: value });
  }, [value, reset]);

  const watchingVisitingHours = watch("visitingHours");
  useEffect(() => {
    if (isDirty) {
      onChange(watchingVisitingHours);
    }
  }, [watchingVisitingHours, isDirty, onChange]);

  return (
    <div className="space-y-4">
      {eventDays.map((day, dayIndex) => (
        <DayField
          key={day.dayId}
          control={control}
          day={day}
          dayIndex={dayIndex}
        />
      ))}
    </div>
  );
}

function DayField({
  control,
  day,
  dayIndex,
}: {
  control: Control<{ visitingHours: VisitingHoursType }>;
  day: VisitingHoursType[number];
  dayIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `visitingHours.${dayIndex}.ranges` as const,
  });

  return (
    <div className="border p-4 rounded-md text-center">
      <h3 className="font-semibold mb-2">{day.label}</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex items-center justify-center flex-wrap space-x-4 mt-2"
        >
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="destructive"
            size="sm"
            className="mt-6"
          >
            <XIcon className="size-4" />
          </Button>
          <Controller
            name={`visitingHours.${dayIndex}.ranges.${index}.open` as const}
            control={control}
            defaultValue={field.open}
            render={({ field }) => (
              <div>
                <label
                  htmlFor={`start-time-${dayIndex}-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Open
                </label>
                <input
                  {...field}
                  type="time"
                  id={`start-time-${dayIndex}-${index}`}
                  className="mt-1 text-black block w-full rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            )}
          />

          <Controller
            name={`visitingHours.${dayIndex}.ranges.${index}.close` as const}
            control={control}
            defaultValue={field.close}
            render={({ field }) => (
              <div>
                <label
                  htmlFor={`end-time-${dayIndex}-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Close
                </label>
                <input
                  {...field}
                  type="time"
                  id={`end-time-${dayIndex}-${index}`}
                  className="mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            )}
          />
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append({ open: "09:00", close: "17:00" })}
        variant="outline"
        size="sm"
        className="mt-2 text-black"
        disabled={fields.length >= 2}
      >
        Add Time Range
      </Button>
    </div>
  );
}
