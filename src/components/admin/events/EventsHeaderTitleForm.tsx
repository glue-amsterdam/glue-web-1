"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { mutate } from "swr";

const eventsHeaderTitleFormSchema = z.object({
  header_title: z.string().min(1, "Header title is required"),
});

export type EventsHeaderTitleFormValues = z.infer<
  typeof eventsHeaderTitleFormSchema
>;

interface EventsHeaderTitleFormProps {
  initialData: EventsHeaderTitleFormValues;
}

export default function EventsHeaderTitleForm({
  initialData,
}: EventsHeaderTitleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<EventsHeaderTitleFormValues>({
    resolver: zodResolver(eventsHeaderTitleFormSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<EventsHeaderTitleFormValues>(
    "/api/admin/events/header-title",
    async (data) => {
      toast({
        title: "Header title updated",
        description: "The events header title has been successfully updated.",
      });
      reset(data);
      await mutate("/api/admin/events/header-title");
      await mutate("/api/events/header-title");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update header title. " + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: EventsHeaderTitleFormValues) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Events Header Title</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <Label htmlFor="header_title">Header Title</Label>
            <Input
              id="header_title"
              className="dashboard-input"
              {...register("header_title")}
              placeholder="Events"
            />
            {errors.header_title && (
              <p className="text-red-500">{errors.header_title.message}</p>
            )}
          </div>
        </div>
        <SaveChangesButton
          watchFields={["header_title"]}
          className="w-full"
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
