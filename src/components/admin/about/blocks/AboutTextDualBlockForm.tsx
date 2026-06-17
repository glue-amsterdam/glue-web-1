"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/editor";
import { uploadImage } from "@/utils/supabase/storage/client";
import { config } from "@/config";
import { cn } from "@/lib/utils";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import type { AboutBlockAdminData } from "@/lib/about/fetch-about-block-admin";
import { getAboutBlockAdmin, saveAboutBlock } from "@/app/actions/admin/about";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  is_visible: z.boolean(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_block_1: z.string(),
  text_block_2: z.string(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  blockId: string;
  blockLabel: string;
  disabled?: boolean;
  initialData?: AboutBlockAdminData | null;
};

const mapInitialDataToForm = (data: AboutBlockAdminData): FormData => ({
  title: data.block?.title ?? "",
  description: data.block?.description ?? "",
  is_visible: data.block?.is_visible ?? false,
  image_src: data.media?.image_src ?? "",
  image_alt: data.media?.image_alt ?? "",
  text_block_1: data.text?.text_block_1 ?? "",
  text_block_2: data.text?.text_block_2 ?? "",
});

export default function AboutTextDualBlockForm({
  blockId,
  blockLabel,
  disabled = false,
  initialData,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? mapInitialDataToForm(initialData)
      : {
          title: "",
          description: "",
          is_visible: false,
          image_src: "",
          image_alt: "",
          text_block_1: "",
          text_block_2: "",
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(mapInitialDataToForm(initialData));
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAboutBlockAdmin(blockId);
        if (data) {
          form.reset(mapInitialDataToForm(data));
        }
      } catch {
        toast({
          title: "Error",
          description: `Failed to load ${blockLabel} block`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [blockId, blockLabel, form, initialData, toast]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }
    const file = e.target.files[0];

    try {
      setUploadState({ stage: "compressing", progress: 5 });

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: config.bucketName,
        folder: `about/blocks/${blockId}`,
        onProgress: handleUploadProgress,
      });

      if (error) {
        throw new Error(error);
      }

      form.setValue("image_src", imageUrl, { shouldDirty: true });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploadState(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await saveAboutBlock(blockId, data);
      toast({
        title: `${blockLabel} updated`,
        description: "Block saved successfully.",
      });
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: `Failed to update ${blockLabel}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Loading {blockLabel}...</p>;
  }

  const imageSrc = form.watch("image_src");
  const isUploading = uploadState !== null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold">{blockLabel}</h2>

        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <FormLabel>Visible</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className={cn(disabled && "hidden")}>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <AdminImagePreview
            src={imageSrc}
            alt={`${blockLabel} block image`}
            uploadState={uploadState}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={handleImageChange}
          />
        </div>

        <FormField
          control={form.control}
          name="text_block_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Block 1</FormLabel>
              <FormControl>
                <RichTextEditor {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="text_block_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Block 2</FormLabel>
              <FormControl>
                <RichTextEditor {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
      </form>
    </Form>
  );
}
