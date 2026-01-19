"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RichTextEditor } from "@/app/components/editor";

const termsSchema = z.object({
  content: z.string().min(1, "Terms and conditions content is required"),
});

export type TermsFormValues = z.infer<typeof termsSchema>;

interface TermsFormProps {
  initialData: TermsFormValues;
}

export default function TermsForm({ initialData }: TermsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<TermsFormValues>({
    resolver: zodResolver(termsSchema),
    defaultValues: initialData,
  });

  const { reset } = form;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<TermsFormValues>(
    "/api/admin/terms",
    async (data) => {
      toast({
        title: "Terms and conditions updated",
        description: "The terms and conditions have been successfully updated.",
      });
      reset(data);
      await mutate("/api/admin/terms");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update terms and conditions. " + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: TermsFormValues) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">General Terms and Conditions</h2>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
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
        <SaveChangesButton
          watchFields={["content"]}
          className="w-full"
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}
