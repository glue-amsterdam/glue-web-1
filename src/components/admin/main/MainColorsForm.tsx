"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MainColorsFormData,
  mainColorsFormSchema,
} from "@/schemas/mainSchema";
import { saveMainColors } from "@/app/actions/admin/main";
import { ColorPicker } from "@/components/ui/color-picker";

interface MainColorsFormProps {
  initialData: MainColorsFormData;
}

const HOME_BACKGROUND_FIELDS: Array<{
  key: keyof Pick<
    MainColorsFormData,
    "box1" | "box2" | "box3" | "box4" | "triangle"
  >;
  label: string;
}> = [
    { key: "box1", label: "Box 1" },
    { key: "box2", label: "Box 2" },
    { key: "box3", label: "Box 3" },
    { key: "box4", label: "Box 4" },
    { key: "triangle", label: "Triangle" },
  ];

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

const EXHIBITOR_BADGE_GROUPS: Array<{
  title: string;
  background: keyof Pick<
    MainColorsFormData,
    | "hubColor"
    | "upToThreeParticipantsColor"
    | "specialProgramColor"
  >;
  font: keyof Pick<
    MainColorsFormData,
    | "hubFontColor"
    | "upToThreeParticipantsFontColor"
    | "specialProgramFontColor"
  >;
}> = [
    {
      title: "Hub",
      background: "hubColor",
      font: "hubFontColor",
    },
    {
      title: "Up to 3 Participants",
      background: "upToThreeParticipantsColor",
      font: "upToThreeParticipantsFontColor",
    },
    {
      title: "Special Program",
      background: "specialProgramColor",
      font: "specialProgramFontColor",
    },
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
  "upToThreeParticipantsColor",
  "hubColor",
  "specialProgramColor",
  "hubFontColor",
  "upToThreeParticipantsFontColor",
  "specialProgramFontColor",
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
          </p>
          <div className="grid grid-cols-2 gap-4">
            {SITE_THEME_FIELDS.map(({ key, label }) =>
              renderColorField(key, label)
            )}
          </div>

          <h3 className="text-lg font-medium pt-4">Exhibitor Badges</h3>
          <p className="text-sm text-gray-600">
            Background and number text for rounded badges (exhibitors, program,
            map).
          </p>
          <div className="space-y-4">
            {EXHIBITOR_BADGE_GROUPS.map(({ title, background, font }) => (
              <div
                key={title}
                className="rounded-md border border-gray-100 p-4 space-y-3"
              >
                <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {renderColorField(background, "Badge background")}
                  {renderColorField(font, "Number text")}
                </div>
              </div>
            ))}
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
