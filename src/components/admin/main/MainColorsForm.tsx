"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import {
  MainColorsFormData,
  mainColorsFormSchema,
} from "@/schemas/mainSchema";
import { saveMainColors } from "@/app/actions/admin/main";
import { ColorPicker } from "@/components/ui/color-picker";

interface MainColorsFormProps {
  initialData: MainColorsFormData;
}

const SITE_THEME_FIELDS: Array<{
  key: keyof Pick<
    MainColorsFormData,
    "primaryColor" | "backgroundColor" | "blackColor" | "whiteColor"
  >;
  label: string;
}> = [
  { key: "primaryColor", label: "Primary" },
  { key: "backgroundColor", label: "Background" },
  { key: "blackColor", label: "Black" },
  { key: "whiteColor", label: "White" },
];

const WATCH_FIELDS: (keyof MainColorsFormData)[] = [
  "box1",
  "box2",
  "box3",
  "box4",
  "triangle",
  "primaryColor",
  "backgroundColor",
  "blackColor",
  "whiteColor",
];

export default function MainColorsForm({ initialData }: MainColorsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<MainColorsFormData>({
    resolver: zodResolver(mainColorsFormSchema),
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

  const onSubmit = createActionSubmitHandler<MainColorsFormData>(
    saveMainColors,
    async (data) => {
      toast({
        title: "Colors updated",
        description: "The colors have been successfully updated.",
      });
      reset(data);
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

  const handleFormSubmit = async (data: MainColorsFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const renderColorField = (key: keyof MainColorsFormData, label: string) => (
    <div key={key}>
      <Label htmlFor={key}>{label}</Label>
      <ColorPicker
        value={watch(key) || "#000000"}
        onChange={(val) =>
          setValue(key, val, { shouldDirty: true })
        }
        name={key}
      />
      {errors[key] && (
        <p className="text-red-500">{errors[key]?.message}</p>
      )}
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <section className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-semibold">Site Theme</h2>
          <p className="text-sm text-gray-600">
            Colors used across the site navbar, dashboard, map, and global UI.
            Participant badge colors are managed under Participant Categories.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {SITE_THEME_FIELDS.map(({ key, label }) =>
              renderColorField(key, label)
            )}
          </div>
        </section>

        <div className="flex justify-start">
          <SaveChangesButton
            watchFields={WATCH_FIELDS}
            isSubmitting={isSubmitting}
          />
        </div>
      </form>
    </FormProvider>
  );
}
