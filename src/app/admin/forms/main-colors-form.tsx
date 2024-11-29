"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { mainColorsSchema } from "@/schemas/baseSchema";
import { MainColors } from "@/utils/menu-types";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MainColorsFormProps {
  initialData: MainColors;
}

export default function MainColorsForm({ initialData }: MainColorsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<MainColors>({
    resolver: zodResolver(mainColorsSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = createSubmitHandler<MainColors>(
    "/api/admin/main/colors",
    () => {
      toast({
        title: "Colors updated",
        description: "The main colors have been successfully updated.",
      });
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update colors. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: MainColors) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Main Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(mainColorsSchema.shape) as Array<keyof MainColors>).map(
            (key) => (
              <div key={key}>
                <Label>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Color
                </Label>
                <Input
                  className="dashboard-input"
                  {...register(key)}
                  placeholder={`${
                    key.charAt(0).toUpperCase() + key.slice(1)
                  } Color`}
                />
                {errors[key] && (
                  <p className="text-red-500">{errors[key]?.message}</p>
                )}
              </div>
            )
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Colors"}
        </Button>
      </form>
    </FormProvider>
  );
}
