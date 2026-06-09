"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  citizensSectionHeaderSchema,
  type CitizensSectionHeader,
} from "@/schemas/citizenSchema";
import { mutate } from "swr";
import { CitizensHeaderForm } from "./CitizensHeaderForm";

export default function AboutCitizensHeaderForm({
  initialData,
}: {
  initialData: CitizensSectionHeader;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CitizensSectionHeader>({
    resolver: zodResolver(citizensSectionHeaderSchema),
    defaultValues: initialData,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<CitizensSectionHeader>(
    "/api/admin/about/citizens",
    async () => {
      toast({
        title: "Citizens section updated",
        description:
          "The citizens of honour section has been successfully updated.",
      });
      await mutate("/api/admin/about/citizens");
      router.refresh();
    },
    () => {
      toast({
        title: "Error",
        description:
          "Failed to update citizens of honour section. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: CitizensSectionHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <CitizensHeaderForm />
        <div className="flex justify-start">
          <SaveChangesButton
            isSubmitting={isSubmitting}
            watchFields={["title", "description", "is_visible"]}
          /></div>
      </form>
    </FormProvider>
  );
}
