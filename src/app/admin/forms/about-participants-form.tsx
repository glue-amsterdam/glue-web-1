"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  ParticipantsSectionHeader,
  participantsSectionSchema,
} from "@/schemas/participantsAdminSchema";
import { mutate } from "swr";
import { Switch } from "@/components/ui/switch";

function ParticipantsSectionForm({
  initialData,
}: {
  initialData: ParticipantsSectionHeader;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<ParticipantsSectionHeader>({
    resolver: zodResolver(participantsSectionSchema),
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

  const onSubmit = createSubmitHandler<ParticipantsSectionHeader>(
    "/api/admin/about/participants",
    async () => {
      toast({
        title: "Participants header updated",
        description: "The participants header have been successfully updated.",
      });
      await mutate("/api/admin/about/participants");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update articipants header. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: ParticipantsSectionHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            name="is_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Visible</FormLabel>
                  <FormDescription>
                    Toggle to show or hide the carousel section
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description", "is_visible"]}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}

export default ParticipantsSectionForm;
