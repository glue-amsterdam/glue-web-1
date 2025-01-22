"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";

const mainInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  is_visible: z.boolean(),
});

type MainInfoFormData = z.infer<typeof mainInfoSchema>;

interface MainInfoFormProps {
  initialData: MainInfoFormData;
}

export function MainInfoForm({ initialData }: MainInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MainInfoFormData>({
    resolver: zodResolver(mainInfoSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const onSubmit = createSubmitHandler<MainInfoFormData>(
    "/api/admin/about/press",
    async () => {
      toast({
        title: "Press header updated",
        description: "The press header have been successfully updated.",
      });
      await mutate("/api/admin/about/press");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update press header. Please try again." + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: MainInfoFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible</FormLabel>
                <FormDescription>
                  Toggle to show or hide the press section
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
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} className="mt-1 bg-white" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="mt-1" rows={4} />
              </FormControl>
            </FormItem>
          )}
        />
        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description", "is_visible"]}
          className="w-full"
        />
      </form>
    </Form>
  );
}
