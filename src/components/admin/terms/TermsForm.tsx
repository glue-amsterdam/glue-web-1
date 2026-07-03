"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { saveTerms } from "@/app/actions/admin/terms";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/editor";

const TALL_EDITOR_CLASS =
  "min-h-[300px] max-h-[60dvh] lg:h-[400px] overflow-y-auto bg-white text-black w-full p-2 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_a]:cursor-pointer";

const termsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
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

  const onSubmit = createActionSubmitHandler<TermsFormValues>(
    saveTerms,
    async (data) => {
      toast({
        title: "Terms and conditions updated",
        description: "The terms and conditions have been successfully updated.",
      });
      reset(data);
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  maxLength={8000}
                  editorClassName={TALL_EDITOR_CLASS}
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SaveChangesButton
          watchFields={["title", "subtitle", "content"]}
          className="w-full"
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}
