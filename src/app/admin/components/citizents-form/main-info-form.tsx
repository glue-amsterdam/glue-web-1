"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  type CitizensSection,
  citizensSectionSchema,
} from "@/schemas/citizenSchema";
import { mutate } from "swr";

interface MainInfoFormProps {
  initialData: {
    title: string;
    description: string;
  };
}

export function MainInfoForm({ initialData }: MainInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CitizensSection>({
    resolver: zodResolver(citizensSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<CitizensSection>(
    "/api/admin/about/citizens",
    async () => {
      toast({
        title: "Citizens headers updated",
        description: "The citizens headers have been successfully updated.",
      });
      await mutate("/api/admin/about/citizens");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update citizens headers. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: CitizensSection) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Section Title"
              defaultValue={initialData.title}
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Section Description"
              defaultValue={initialData.description}
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>
        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description"]}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}
