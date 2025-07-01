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
import { ColorPicker } from "@/components/ui/color-picker";

const homeTextFormSchema = z.object({
  label: z.string().min(1, "Text is required"),
  color: z.string().optional().nullable(),
});

type HomeTextFormValues = z.infer<typeof homeTextFormSchema>;

interface MainHomeTextFormProps {
  initialData: { label: string; color?: string | null };
}

export default function MainHomeTextForm({
  initialData,
}: MainHomeTextFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<HomeTextFormValues>({
    resolver: zodResolver(homeTextFormSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<HomeTextFormValues>(
    "/api/admin/main/home_text",
    async () => {
      toast({
        title: "Home text updated",
        description: "The home text has been successfully updated.",
      });
      await mutate("/api/admin/main/home_text");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update home text. " + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: HomeTextFormValues) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Home Text & Color</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="label">Text</Label>
            <Input
              id="label"
              className="dashboard-input"
              {...register("label")}
              placeholder="Main home text"
            />
            {errors.label && (
              <p className="text-red-500">{errors.label.message}</p>
            )}
          </div>
          <div>
            <ColorPicker
              value={watch("color") || "#ffffff"}
              onChange={(val) => methods.setValue("color", val)}
              name="color"
              label="Color (hex)"
            />
            {errors.color && (
              <p className="text-red-500">{errors.color.message}</p>
            )}
          </div>
        </div>
        <SaveChangesButton
          watchFields={["label", "color"]}
          className="w-full"
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
