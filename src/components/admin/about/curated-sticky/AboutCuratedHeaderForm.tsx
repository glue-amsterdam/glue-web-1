"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { saveAboutCuratedSection } from "@/app/actions/admin/about";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  CuratedMemberSectionHeader,
  curatedMembersSectionSchema,
} from "@/schemas/curatedSchema";
import { CuratedHeaderForm } from "./CuratedHeaderForm";

export default function AboutCuratedHeaderForm({
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

  const onSubmit = createActionSubmitHandler<CuratedMemberSectionHeader>(
    saveAboutCuratedSection,
    async () => {
      toast({
        title: "Sticky participants section updated",
        description:
          "The sticky participants section has been successfully updated.",
      });
      router.refresh();
    },
    () => {
      toast({
        title: "Error",
        description:
          "Failed to update sticky participants section. Please try again.",
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
        <div className="flex justify-start">
          <SaveChangesButton
            isSubmitting={isSubmitting}
            watchFields={["title", "description", "is_visible"]}
          /></div>
      </form>
    </FormProvider>
  );
}
