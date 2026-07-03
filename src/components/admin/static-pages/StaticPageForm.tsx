"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { saveStaticPage } from "@/app/actions/admin/static-pages";
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
import {
  STATIC_PAGE_ADMIN_LABELS,
  type StaticPageSlug,
} from "@/lib/static-pages/static-pages-config";

const staticPageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

export type StaticPageFormValues = z.infer<typeof staticPageFormSchema>;

interface StaticPageFormProps {
  slug: StaticPageSlug;
  initialData: StaticPageFormValues;
}

const TALL_EDITOR_CLASS =
  "min-h-[300px] max-h-[60dvh] lg:h-[400px] overflow-y-auto bg-white text-black w-full p-2 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_a]:cursor-pointer";

export default function StaticPageForm({ slug, initialData }: StaticPageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pageLabel = STATIC_PAGE_ADMIN_LABELS[slug];

  const form = useForm<StaticPageFormValues>({
    resolver: zodResolver(staticPageFormSchema),
    defaultValues: initialData,
  });

  const { reset } = form;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler<StaticPageFormValues>(
    (data) => saveStaticPage(slug, data),
    async (data) => {
      toast({
        title: `${pageLabel} updated`,
        description: `The ${pageLabel.toLowerCase()} page has been successfully updated.`,
      });
      reset(data);
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: `Failed to update ${pageLabel.toLowerCase()}. ${error}`,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: StaticPageFormValues) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">{pageLabel}</h2>
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
              <FormLabel>Subtitle (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={3} />
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
