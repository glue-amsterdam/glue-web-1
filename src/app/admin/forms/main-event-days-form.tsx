"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EventDay, eventDaysSchema } from "@/schemas/eventSchemas";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

interface EventDaysFormProps {
  initialData: { eventDays: EventDay[] };
}

export default function EventDaysForm({ initialData }: EventDaysFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<{ eventDays: EventDay[] }>({
    resolver: zodResolver(eventDaysSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const { fields } = useFieldArray({
    control,
    name: "eventDays",
  });

  const watchEventDays = watch("eventDays");

  const onSubmit = createSubmitHandler<{ eventDays: EventDay[] }>(
    "/api/admin/main/days",
    () => (data: { eventDays: EventDay[] }) => {
      console.log("Form submitted successfully with data:", data);
      toast({
        title: "Event days updated",
        description:
          "The event day labels and dates have been successfully updated.",
      });
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description:
          "Failed to update event day information. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: { eventDays: EventDay[] }) => {
    console.log("handleFormSubmit called with data:", data);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-2 justify-center items-center gap-4"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                {`Event Day ${index + 1} Label`}
              </label>
              <Input
                {...methods.register(`eventDays.${index}.label`)}
                defaultValue={field.label}
                placeholder="Event Day Label"
                className="dashboard-input"
              />
              {errors.eventDays?.[index]?.label && (
                <p className="text-red-500">
                  {errors.eventDays[index]?.label?.message}
                </p>
              )}
            </div>
            <div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  {`Event Day ${index + 1} Date`}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchEventDays[index]?.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchEventDays[index]?.date ? (
                        format(new Date(watchEventDays[index].date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        watchEventDays[index]?.date
                          ? new Date(watchEventDays[index].date)
                          : undefined
                      }
                      onSelect={(date) => {
                        setValue(
                          `eventDays.${index}.date`,
                          date ? date.toISOString() : null,
                          { shouldDirty: true }
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.eventDays?.[index]?.date && (
                  <p className="text-red-500">
                    {errors.eventDays[index]?.date?.message}
                  </p>
                )}
              </div>
              <input
                type="hidden"
                {...methods.register(`eventDays.${index}.dayId`)}
              />
            </div>
          </div>
        ))}
        {errors.eventDays && !Array.isArray(errors.eventDays) && (
          <p className="text-red-500">{errors.eventDays.message}</p>
        )}
        <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
      </form>
    </FormProvider>
  );
}
