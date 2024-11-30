"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ParticipantsSectionContent,
  participantsSectionSchema,
} from "@/schemas/baseSchema";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function ParticipantsSectionForm({
  initialData,
}: {
  initialData: ParticipantsSectionContent;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<ParticipantsSectionContent>({
    resolver: zodResolver(participantsSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = createSubmitHandler<ParticipantsSectionContent>(
    "/api/admin/about/participants",
    () => {
      console.log("Form submitted successfully");
      toast({
        title: "Links updated",
        description: "The main links have been successfully updated.",
      });
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update main links. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: ParticipantsSectionContent) => {
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
          {`To add or remove displayed participants, please manage them from the user administration by marking/unmarking them as "participant."`}
        </p>
        <SaveChangesButton isSubmitting={isSubmitting} type="submit">
          Save Changes
        </SaveChangesButton>
      </form>
    </FormProvider>
  );
}

export default ParticipantsSectionForm;
