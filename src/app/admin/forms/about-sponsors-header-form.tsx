"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SponsorsHeader, sponsorsHeaderSchema } from "@/schemas/sponsorsSchema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createSubmitHandler } from "@/utils/form-helpers";
import { mutate } from "swr";

export default function SponsorsHeaderForm({
  initialData,
}: {
  initialData: SponsorsHeader;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<SponsorsHeader>({
    resolver: zodResolver(sponsorsHeaderSchema),
    defaultValues: initialData,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sponsors_types",
  });

  const onSubmit = createSubmitHandler<SponsorsHeader>(
    "/api/admin/about/sponsors/header",
    async () => {
      toast({
        title: "Sponsors header updated",
        description: "The sponsors header have been successfully updated.",
      });
      await mutate("/api/admin/about/sponsors/header");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update sponsors header. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: SponsorsHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label>Sponsor Types</Label>
          {fields.map((field, index) => (
            <div
              key={field.label + index}
              className="flex items-center space-x-2 mt-2"
            >
              <Input
                {...register(`sponsors_types.${index}.label`)}
                placeholder="Sponsor type"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.sponsors_types && (
            <p className="text-red-500">
              {Array.isArray(errors.sponsors_types)
                ? errors.sponsors_types[0]?.label?.message
                : errors.sponsors_types.message}
            </p>
          )}
          {fields.length <= 8 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ label: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Sponsor Type
            </Button>
          )}
        </div>

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description", "sponsorsTypes"]}
          className="w-full"
          disabled={!isDirty}
        />
      </form>
    </FormProvider>
  );
}
