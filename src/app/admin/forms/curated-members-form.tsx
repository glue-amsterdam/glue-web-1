"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CuratedMemberSectionContent,
  curatedMembersSectionSchema,
} from "@/schemas/baseSchema";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

export default function CuratedMembersForm({
  initialData,
}: {
  initialData: CuratedMemberSectionContent;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CuratedMemberSectionContent>({
    resolver: zodResolver(curatedMembersSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = createSubmitHandler<CuratedMemberSectionContent>(
    "/api/admin/about/curated",
    () => {
      console.log("Form submitted successfully");
      toast({
        title: "Links updated",
        description: "The curated section have been successfully updated.",
      });
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

  const handleFormSubmit = async (data: CuratedMemberSectionContent) => {
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
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {`To add or remove displayed curated members, please manage them from the user administration by marking/unmarking them as "curated/sticky."`}
        </p>
        <SaveChangesButton isSubmitting={isSubmitting} type="submit">
          Save Changes
        </SaveChangesButton>
      </form>
    </FormProvider>
  );
}
