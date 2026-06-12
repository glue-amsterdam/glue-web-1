"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { savePlansBasePackage } from "@/app/actions/admin/plans";
import type { ParticipateBasePackageAdminData } from "@/lib/participate/types";
import {
  participateBasePackageUpdateSchema,
  type ParticipateBasePackageUpdate,
} from "@/schemas/participatePlansSchema";

type Props = {
  initialData: ParticipateBasePackageAdminData;
};

const ParticipateBasePackageForm = ({ initialData }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<ParticipateBasePackageUpdate>({
    resolver: zodResolver(participateBasePackageUpdateSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "base_plan_items",
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler<ParticipateBasePackageUpdate>(
    savePlansBasePackage,
    async (updated) => {
      reset(updated);
      toast({
        title: "Base package updated",
        description: "The intro card has been successfully updated.",
      });
      router.refresh();
    },
    () => {
      toast({
        title: "Error",
        description: "Failed to update the base package. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (values: ParticipateBasePackageUpdate) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="base_plan_label">Card title</Label>
          <Input id="base_plan_label" {...register("base_plan_label")} />
          {errors.base_plan_label && (
            <p className="text-red-500">{errors.base_plan_label.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="base_plan_subtitle">Subtitle</Label>
          <Input id="base_plan_subtitle" {...register("base_plan_subtitle")} />
          {errors.base_plan_subtitle && (
            <p className="text-red-500">{errors.base_plan_subtitle.message}</p>
          )}
        </div>
        <div>
          <Label>Features</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mt-2">
              <Input
                {...register(`base_plan_items.${index}.label` as const)}
                defaultValue={field.label}
                placeholder="Feature description"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
                aria-label="Remove feature"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.base_plan_items && (
            <p className="text-red-500">{errors.base_plan_items.message}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ label: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
        <SaveChangesButton isSubmitting={isSubmitting} />
      </form>
    </FormProvider>
  );
};

export default ParticipateBasePackageForm;
