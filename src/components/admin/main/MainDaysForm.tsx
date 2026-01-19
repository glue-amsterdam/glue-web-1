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
import { useState, useCallback, useMemo, useEffect } from "react";
import { CalendarIcon, PlusCircle, MinusCircle } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { EventDay, eventDaysSchema } from "@/schemas/eventSchemas";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";

interface EventDaysFormProps {
  initialData: { eventDays: EventDay[] };
  onDataUpdated?: () => void;
}

export default function MainDaysForm({ initialData, onDataUpdated }: EventDaysFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<{ eventDays: EventDay[] }>({
    resolver: zodResolver(eventDaysSchema),
    defaultValues: {
      eventDays: initialData.eventDays,
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
  } = methods;

  useEffect(() => {
    // Only reset if the form is not dirty to avoid losing user changes
    // This ensures the form stays in sync with the initialData prop
    if (!methods.formState.isDirty) {
      reset(initialData);
    }
  }, [initialData, reset, methods.formState.isDirty]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "eventDays",
  });

  const watchEventDays = watch("eventDays");

  const onSubmit = createSubmitHandler<{ eventDays: EventDay[] }>(
    "/api/admin/main/days",
    async (responseData) => {
      toast({
        title: "Event days updated",
        description:
          "The event day labels and dates have been successfully updated.",
      });

      // Notify parent component to reload data first
      if (onDataUpdated) {
        onDataUpdated();
      }
      
      // Reset the form with the server response to clear dirty state
      // This ensures the form is in sync with what the server returned
      reset(responseData);
      
      router.refresh();
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
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect = useCallback(
    (index: number, date: Date | undefined) => {
      const newDate = date ? date.toISOString() : null;
      setValue(`eventDays.${index}.date`, newDate, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      // Check for uniqueness
      const otherDates = Array.isArray(watchEventDays)
        ? watchEventDays.filter((_, i) => i !== index).map((day) => day.date)
        : [];

      if (
        newDate &&
        otherDates.some(
          (otherDate) =>
            otherDate && isSameDay(new Date(otherDate), new Date(newDate))
        )
      ) {
        setError(`eventDays.${index}.date`, {
          type: "manual",
          message: "This date is already selected for another event day.",
        });
      } else {
        clearErrors(`eventDays.${index}.date`);
      }
    },
    [setValue, watchEventDays, setError, clearErrors]
  );

  const disabledDates = useMemo(() => {
    const days = Array.isArray(watchEventDays) ? watchEventDays : [];
    return days.reduce((acc: Date[], day) => {
      if (day.date) {
        acc.push(new Date(day.date));
      }
      return acc;
    }, []);
  }, [watchEventDays]);

  const addNewDay = useCallback(() => {
    const newIndex = fields.length;
    append({
      dayId: `day-${newIndex + 1}`,
      label: `Day ${newIndex + 1}`,
      date: null,
    });
  }, [append, fields.length]);

  const removeLastDay = useCallback(() => {
    remove(fields.length - 1);
  }, [remove, fields.length]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="flex justify-between mb-4">
          <Button
            type="button"
            onClick={addNewDay}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Day
          </Button>
          <Button
            type="button"
            onClick={removeLastDay}
            className="flex items-center"
            disabled={fields.length === 0}
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Remove Last Day
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-center text-gray-500">{`No event days defined. Click "Add Day" to create one.`}</p>
        ) : (
          fields.map((field, index) => (
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
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watchEventDays[index]?.date &&
                            "text-muted-foreground"
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
                        onSelect={(date) => handleDateSelect(index, date)}
                        disabled={(date) =>
                          disabledDates.some((disabledDate) =>
                            isSameDay(date, disabledDate)
                          ) &&
                          !isSameDay(
                            date,
                            new Date(watchEventDays[index]?.date || "")
                          )
                        }
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
                  value={`day-${index + 1}`}
                />
              </div>
            </div>
          ))
        )}
        {errors.eventDays && !Array.isArray(errors.eventDays) && (
          <p className="text-red-500">{errors.eventDays.message}</p>
        )}
        <SaveChangesButton
          watchFields={["eventDays"]}
          className="w-full"
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
