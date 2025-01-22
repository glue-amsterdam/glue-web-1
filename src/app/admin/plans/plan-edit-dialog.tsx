"use client";

import { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlanSchema, type PlanType } from "@/schemas/plansSchema";
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

  const methods = useForm<PlanType>({
    resolver: zodResolver(PlanSchema),
    defaultValues: plan,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "plan_items",
  });

  const onSubmit = async (data: PlanType) => {
    setIsSubmitting(true);
    try {
      const updatedPlan = await updatePlan(data);
      onSave(updatedPlan);
      toast({
        title: `${data.plan_label} plan updated`,
        description: `${data.plan_label} plan has been successfully updated.`,
      });
    } catch (error) {
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
          <DialogTitle>Edit Plan</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register("plan_price")}
                disabled={plan.plan_id === "planId-0"}
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
              ]}
              className="w-full"
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
