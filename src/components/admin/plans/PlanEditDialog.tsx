"use client";

import { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlanAdminUpdateSchema,
  type PlanType,
} from "@/schemas/plansSchema";
import { updatePlan } from "@/app/actions/plans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

type PlanAdminFormValues = Omit<PlanType, "plan_type">;

interface PlanEditDialogProps {
  plan: PlanType;
  onSave: (updatedPlan: PlanType) => void;
  onClose: () => void;
}

export default function PlanEditDialog({
  plan,
  onSave,
  onClose,
}: PlanEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<PlanAdminFormValues>({
    resolver: zodResolver(PlanAdminUpdateSchema),
    defaultValues: {
      ...plan,
      plan_max_images: plan.plan_max_images ?? 3,
      max_events: plan.max_events ?? 6,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "plan_items",
  });

  const onSubmit = async (data: PlanAdminFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedPlan = await updatePlan(data);
      onSave(updatedPlan);
      toast({
        title: `${data.plan_label} plan updated`,
        description: `${data.plan_label} plan has been successfully updated.`,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to update ${data.plan_label} plan. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] max-h-[90%] overflow-y-scroll text-black">
        <DialogHeader>
          <DialogTitle>Edit Participant Plan</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("plan_id")} />
            <input
              type="hidden"
              {...register("order_by", { valueAsNumber: true })}
            />
            <input type="hidden" {...register("is_participant_enabled")} />
            <div>
              <Label htmlFor="plan_label">Plan Label</Label>
              <Input id="plan_label" {...register("plan_label")} />
              {errors.plan_label && (
                <p className="text-red-500">{errors.plan_label.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="plan_price">Plan Price</Label>
              <Input
                id="plan_price"
                type="number"
                min={0}
                step="any"
                {...register("plan_price", { valueAsNumber: true })}
              />
              {errors.plan_price && (
                <p className="text-red-500">{errors.plan_price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="plan_currency">Plan Currency</Label>
              <Input id="plan_currency" {...register("plan_currency")} />
              {errors.plan_currency && (
                <p className="text-red-500">{errors.plan_currency.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="currency_logo">Currency Logo</Label>
              <Input id="currency_logo" {...register("currency_logo")} />
              {errors.currency_logo && (
                <p className="text-red-500">{errors.currency_logo.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="plan_description">Plan Description</Label>
              <Textarea
                id="plan_description"
                {...register("plan_description")}
              />
              {errors.plan_description && (
                <p className="text-red-500">
                  {errors.plan_description.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="plan_max_images">Max profile images</Label>
              <Input
                id="plan_max_images"
                type="number"
                min={0}
                {...register("plan_max_images", { valueAsNumber: true })}
              />
              {errors.plan_max_images && (
                <p className="text-red-500">
                  {errors.plan_max_images.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="max_events">Max events</Label>
              <Input
                id="max_events"
                type="number"
                min={0}
                {...register("max_events", { valueAsNumber: true })}
              />
              {errors.max_events && (
                <p className="text-red-500">{errors.max_events.message}</p>
              )}
            </div>
            <div>
              <Label>Plan Items</Label>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center space-x-2 mt-2"
                >
                  <Input
                    {...register(`plan_items.${index}.label` as const)}
                    defaultValue={field.label}
                    placeholder="Item description"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label="Remove item"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.plan_items && (
                <p className="text-red-500">{errors.plan_items.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ label: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <SaveChangesButton
              isSubmitting={isSubmitting}
              watchFields={[
                "plan_label",
                "plan_price",
                "plan_currency",
                "currency_logo",
                "plan_description",
                "plan_items",
                "plan_max_images",
                "max_events",
              ]}
              className="w-full"
              disabled={!isDirty}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
