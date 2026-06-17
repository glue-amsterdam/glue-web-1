"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { saveAboutParticipantsSection } from "@/app/actions/admin/about";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import {
  ParticipantsSectionHeader,
  participantsSectionSchema,
} from "@/schemas/participantsAdminSchema";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/editor";
import { Input } from "@/components/ui/input";

function AboutParticipantsForm({
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

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler<ParticipantsSectionHeader>(
    saveAboutParticipantsSection,
    async () => {
      toast({
        title: "Exhibitors header updated",
        description: "The exhibitors header have been successfully updated.",
      });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update exhibitors header. Please try again." + error,
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
        <FormField
          control={control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible</FormLabel>
                <FormDescription>
                  Toggle to show or hide the exhibitors section
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
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-start">
          <SaveChangesButton
            isSubmitting={isSubmitting}
            watchFields={["title", "description", "is_visible"]}

          /></div>
      </form>
    </FormProvider>
  );
}

export default AboutParticipantsForm;
