"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import {
  saveParticipantCategory,
  removeParticipantCategory,
} from "@/app/actions/admin/participant-categories";
import {
  participantCategoryUserFormSchema,
  type ParticipantCategoryUserFormData,
} from "@/schemas/participantCategorySchema";

type ParticipantCategoryFormProps = {
  initialData: ParticipantCategoryUserFormData;
  isNew?: boolean;
  canDelete?: boolean;
};

const WATCH_FIELDS: (keyof ParticipantCategoryUserFormData)[] = [
  "label",
  "bgColor",
  "fontColor",
  "sortOrder",
];

export const ParticipantCategoryForm = ({
  initialData,
  isNew = false,
  canDelete = false,
}: ParticipantCategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<ParticipantCategoryUserFormData>({
    resolver: zodResolver(participantCategoryUserFormSchema),
    defaultValues: initialData,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = createActionSubmitHandler<ParticipantCategoryUserFormData>(
    saveParticipantCategory,
    async (data) => {
      toast({
        title: isNew ? "Category created" : "Category saved",
        description: isNew
          ? "Participant category created successfully."
          : "Participant category updated successfully.",
      });
      reset(data);
      router.refresh();
      if (isNew) {
        router.push("/admin/participant-categories");
      }
    },
    (error) => {
      toast({
        title: "Error",
        description: `Failed to save category. ${error}`,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: ParticipantCategoryUserFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!initialData.id || !canDelete) return;
    if (
      !window.confirm(
        "Delete this category? Participants will be reassigned to standard."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeParticipantCategory(initialData.id);
      toast({
        title: "Category deleted",
        description: "Participants were reassigned to standard.",
      });
      router.push("/admin/participant-categories");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete category.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderColorField = (
    key: "bgColor" | "fontColor",
    label: string
  ) => (
    <div key={key}>
      <Label htmlFor={key}>{label}</Label>
      <ColorPicker
        value={watch(key) || "#000000"}
        onChange={(val) => setValue(key, val, { shouldDirty: true })}
        name={key}
      />
      {errors[key] && (
        <p className="text-red-500">{errors[key]?.message}</p>
      )}
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {!isNew && initialData.id ? (
          <input type="hidden" {...register("id")} />
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" {...methods.register("label")} />
            {errors.label && (
              <p className="text-red-500">{errors.label.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Shown in filters across exhibitors, map, and the moderator profile
              selector.
            </p>
          </div>
          <div>
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              type="number"
              {...methods.register("sortOrder", { valueAsNumber: true })}
            />
            {errors.sortOrder && (
              <p className="text-red-500">{errors.sortOrder.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Lower numbers appear first in filters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {renderColorField("bgColor", "Badge background")}
          {renderColorField("fontColor", "Number text")}
        </div>

        <div className="flex items-center gap-4">
          <SaveChangesButton
            watchFields={isNew ? [] : WATCH_FIELDS}
            isDirty={isNew}
            label={isNew ? "Create category" : undefined}
            isSubmitting={isSubmitting}
          />
          {!isNew && canDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
