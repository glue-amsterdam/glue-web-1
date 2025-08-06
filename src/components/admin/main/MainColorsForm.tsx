"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MainColors, mainColorsSchema } from "@/schemas/mainSchema";
import { mutate } from "swr";
import { ColorPicker } from "@/components/ui/color-picker";

interface MainColorsFormProps {
  initialData: MainColors;
}

export default function MainColorsForm({ initialData }: MainColorsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<MainColors>({
    resolver: zodResolver(mainColorsSchema),
    defaultValues: initialData,
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<MainColors>(
    "/api/admin/main/colors",
    async (data) => {
      toast({
        title: "Colors updated",
        description: "The main colors have been successfully updated.",
      });
      reset(data);
      await mutate("/api/admin/main/colors");
      router.refresh();
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
        <div className="h-36 bg-gray-200 rounded-lg relative aspect-[4/3]">
          <Image
            src={"/admin/colors.jpg"}
            fill
            alt="Color scheme representation"
            priority={false}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 30vw"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(mainColorsSchema.shape) as Array<keyof MainColors>).map(
            (key) => (
              <div key={key}>
                <Label htmlFor={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Color
                </Label>
                <ColorPicker
                  value={watch(key) || "#000000"}
                  onChange={(val) => setValue(key, val, { shouldDirty: true })}
                  name={key}
                />
                {errors[key] && (
                  <p className="text-red-500">{errors[key]?.message}</p>
                )}
              </div>
            )
          )}
        </div>
        <SaveChangesButton
          watchFields={["box1", "box2", "box3", "box4", "triangle"]}
          className="w-full"
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
