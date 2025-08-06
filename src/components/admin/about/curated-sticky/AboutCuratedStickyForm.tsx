"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  CuratedMemberSectionHeader,
  curatedMembersSectionSchema,
} from "@/schemas/curatedSchema";
import { mutate } from "swr";
import { CuratedHeaderForm } from "./CuratedHeaderForm";
import { StickyGroupsManager } from "./StickyGroupsManager";

export default function CuratedMembersForm({
  initialData,
}: {
  initialData: CuratedMemberSectionHeader;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CuratedMemberSectionHeader>({
    resolver: zodResolver(curatedMembersSectionSchema),
    defaultValues: initialData,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<CuratedMemberSectionHeader>(
    "/api/admin/about/curated",
    async () => {
      console.log("Form submitted successfully");
      toast({
        title: "Curated section updated",
        description: "The curated section have been successfully updated.",
      });
      await mutate("/api/admin/about/curated");
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update curated section. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: CuratedMemberSectionHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <CuratedHeaderForm />
        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={[
            "title",
            "description",
            "is_visible",
            "text_color",
            "background_color",
          ]}
          className="w-full"
        />
      </form>

      <StickyGroupsManager />
    </FormProvider>
  );
}
