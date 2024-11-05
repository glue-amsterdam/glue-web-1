import React from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { hourLimits } from "@/utils/hourLimits";

const timeRangeSchema = z.object({
  open: z.string(),
  close: z.string(),
});

const daySchema = z.object({
  isOpen: z.boolean(),
  timeRanges: z.array(timeRangeSchema),
});

const visitingHoursSchema = z.object({
  Thursday: daySchema,
  Friday: daySchema,
  Saturday: daySchema,
  Sunday: daySchema,
});

type VisitingHoursType = z.infer<typeof visitingHoursSchema>;

interface VisitingHoursFormProps {
  value: VisitingHoursType;
  onChange: (value: VisitingHoursType) => void;
}

export default function VisitingHoursForm({
  value,
  onChange,
}: VisitingHoursFormProps) {
  const form = useForm<VisitingHoursType>({
    resolver: zodResolver(visitingHoursSchema),
    defaultValues: value,
  });

  React.useEffect(() => {
    const subscription = form.watch((formValues) => {
      onChange(formValues as VisitingHoursType);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onChange, form]);

  return (
    <div className="space-y-2 bg-uiblack p-2">
      {Object.entries(form.getValues()).map(([day]) => (
        <DayField key={day} day={day as keyof VisitingHoursType} form={form} />
      ))}
    </div>
  );
}

function DayField({
  day,
  form,
}: {
  day: keyof VisitingHoursType;
  form: ReturnType<typeof useForm<VisitingHoursType>>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${day}.timeRanges` as const,
  });

  return (
    <FormField
      control={form.control}
      name={`${day}.isOpen` as const}
      render={({ field }) => (
        <FormItem className="flex flex-col dashboard-form-item">
          <div className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="font-bold dashboard-label">{day}</FormLabel>
          </div>
          {field.value && (
            <div className="ml-6 space-y-4">
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-wrap gap-1 justify-start items-center space-x-2"
                >
                  <TimeRangeField
                    day={day}
                    index={index}
                    form={form}
                    remove={remove}
                    isLast={index === fields.length - 1}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-black"
                onClick={() => append({ open: "09:00", close: "17:00" })}
              >
                Add Range
              </Button>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}

function TimeRangeField({
  day,
  index,
  form,
  remove,
  isLast,
}: {
  day: keyof VisitingHoursType;
  index: number;
  form: ReturnType<typeof useForm<VisitingHoursType>>;
  remove: (index: number) => void;
  isLast: boolean;
}) {
  return (
    <>
      {!isLast && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="bg-uired/80 hover:bg-uired text-uiwhite hover:text-uiwhite"
        >
          X
        </Button>
      )}
      <FormField
        control={form.control}
        name={`${day}.timeRanges.${index}.open` as const}
        render={({ field }) => (
          <FormItem>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full dashboard-input">
                  <SelectValue placeholder="Open" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {hourLimits.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      <span>to</span>
      <FormField
        control={form.control}
        name={`${day}.timeRanges.${index}.close` as const}
        render={({ field }) => (
          <FormItem>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!form.getValues(`${day}.timeRanges.${index}.open`)}
            >
              <FormControl>
                <SelectTrigger className="w-full dashboard-input">
                  <SelectValue placeholder="Close" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {hourLimits.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </>
  );
}
