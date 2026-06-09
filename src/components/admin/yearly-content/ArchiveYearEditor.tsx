"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  ArchiveYearMediaFields,
  createEmptyArchiveYearValues,
  useArchiveYearMediaState,
  type ArchiveYearFormValues,
} from "@/components/admin/about/archive/ArchiveYearMediaFields";
import { processArchiveYearMediaUpload } from "@/components/admin/about/archive/process-archive-year-media";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

const yearFormSchema = z.object({
  year: z.number().int(),
  media_type: z.enum(["video", "image"]).nullable(),
  video_src: z.string().optional(),
  video_poster: z.string().optional(),
  video_alt: z.string().optional(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  text_title: z.string(),
  text_description: z.string(),
});

type ArchiveYearEditorProps = {
  year: number;
  onSaved?: () => void;
  onDeleted?: () => void;
};

export const ArchiveYearEditor = ({
  year,
  onSaved,
  onDeleted,
}: ArchiveYearEditorProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existsInDb, setExistsInDb] = useState(false);
  const [hasMediaChanges, setHasMediaChanges] = useState(false);
  const [isMediaBusy, setIsMediaBusy] = useState(false);
  const loadedMediaTypeRef = useRef<"video" | "image" | null>(null);
  const mediaState = useArchiveYearMediaState();

  const form = useForm<ArchiveYearFormValues>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: createEmptyArchiveYearValues(year),
  });

  const mediaType = form.watch("media_type");
  const isBusy = isSubmitting || isMediaBusy;

  const loadYear = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/about/archive/years");
      const data = await res.json();
      const yearRow = (data.years ?? []).find(
        (y: { year: number }) => y.year === year
      );

      if (!yearRow) {
        setExistsInDb(false);
        loadedMediaTypeRef.current = null;
        const emptyValues = createEmptyArchiveYearValues(year);
        form.reset(emptyValues);
        mediaState.syncFromValues(emptyValues);
        return;
      }

      setExistsInDb(true);
      loadedMediaTypeRef.current = yearRow.media_type ?? null;
      const values: ArchiveYearFormValues = {
        year: yearRow.year,
        media_type: yearRow.media_type,
        video_src: yearRow.video_src ?? "",
        video_poster: yearRow.video_poster ?? "",
        video_alt: yearRow.video_alt ?? "",
        image_src: yearRow.image_src ?? "",
        image_alt: yearRow.image_alt ?? "",
        text_title: yearRow.text_title ?? "",
        text_description: yearRow.text_description ?? "",
      };
      form.reset(values);
      mediaState.syncFromValues(values);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load archive year.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [year, form, toast, mediaState.syncFromValues]);

  useEffect(() => {
    loadYear();
  }, [loadYear]);

  const handleMediaTypeChange = (value: "video" | "image" | null) => {
    form.setValue("media_type", value, { shouldDirty: true });
  };

  const handleRemoveVideo = () => {
    const storedUrl = form.getValues("video_src");
    mediaState.removeVideoPreview(storedUrl);
    form.setValue("video_src", "", { shouldDirty: true });
  };

  const handleRemovePoster = () => {
    const storedUrl = form.getValues("video_poster");
    mediaState.removePosterPreview(storedUrl);
    form.setValue("video_poster", "", { shouldDirty: true });
  };

  const handleRemoveImage = () => {
    const storedUrl = form.getValues("image_src");
    mediaState.removeImagePreview(storedUrl);
    form.setValue("image_src", "", { shouldDirty: true });
  };

  const buildPayload = async (
    data: ArchiveYearFormValues
  ): Promise<ArchiveYearFormValues> => {
    const mediaValues = await processArchiveYearMediaUpload({
      data,
      pending: {
        videoFile: mediaState.pendingVideoFile,
        posterFile: mediaState.pendingPosterFile,
        imageFile: mediaState.pendingImageFile,
      },
      urlsMarkedForDeletion: mediaState.urlsMarkedForDeletion,
      previousMediaType: loadedMediaTypeRef.current,
      setVideoUploadState: mediaState.setVideoUploadState,
      setPosterUploadState: mediaState.setPosterUploadState,
      setImageUploadState: mediaState.setImageUploadState,
    });

    return {
      ...data,
      ...mediaValues,
      video_src: mediaValues.video_src ?? "",
      video_poster: mediaValues.video_poster ?? "",
      video_alt: mediaValues.video_alt ?? "",
      image_src: mediaValues.image_src ?? "",
      image_alt: mediaValues.image_alt ?? "",
    };
  };

  const handleCreate = async (data: ArchiveYearFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = await buildPayload(data);
      const res = await fetch("/api/admin/about/archive/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Create failed");
      }
      toast({
        title: "Created",
        description: `Archive ${year} created.`,
      });
      setExistsInDb(true);
      loadedMediaTypeRef.current = payload.media_type ?? null;
      mediaState.clearPendingFiles();
      mediaState.syncFromValues(payload);
      form.reset(payload);
      onSaved?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create archive year",
        variant: "destructive",
      });
    } finally {
      mediaState.setVideoUploadState(null);
      mediaState.setPosterUploadState(null);
      mediaState.setImageUploadState(null);
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: ArchiveYearFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = await buildPayload(data);
      const res = await fetch(`/api/admin/about/archive/years/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Update failed");
      }
      toast({
        title: "Saved",
        description: `Archive ${year} updated.`,
      });
      loadedMediaTypeRef.current = payload.media_type ?? null;
      mediaState.clearPendingFiles();
      mediaState.syncFromValues(payload);
      form.reset(payload);
      onSaved?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update archive year",
        variant: "destructive",
      });
    } finally {
      mediaState.setVideoUploadState(null);
      mediaState.setPosterUploadState(null);
      mediaState.setImageUploadState(null);
      setIsSubmitting(false);
    }
  };

  const handleDeleteArchive = async () => {
    if (
      !confirm(
        `Delete the entire archive for ${year}? This removes title, description, video, poster, image, and all stored files.`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/about/archive/years/${year}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      toast({
        title: "Deleted",
        description: `Archive ${year} deleted.`,
      });

      setExistsInDb(false);
      loadedMediaTypeRef.current = null;
      const emptyValues = createEmptyArchiveYearValues(year);
      mediaState.syncFromValues(emptyValues);
      form.reset(emptyValues);
      onDeleted?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete archive year",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading archive...</p>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(existsInDb ? handleUpdate : handleCreate)}
        className="space-y-4"
      >
        <ArchiveYearMediaFields
          control={form.control}
          mediaType={mediaType}
          disabled={isBusy}
          mediaState={mediaState}
          onMediaTypeChange={handleMediaTypeChange}
          onRemoveVideo={handleRemoveVideo}
          onRemovePoster={handleRemovePoster}
          onRemoveImage={handleRemoveImage}
          onBusyChange={setIsMediaBusy}
          onHasMediaChangesChange={setHasMediaChanges}
        />

        <FormField
          control={form.control}
          name="text_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  disabled={isBusy}
                  aria-label="Text title"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="text_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  rows={3}
                  disabled={isBusy}
                  aria-label="Text description"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <SaveChangesButton
            isSubmitting={isSubmitting}
            isDirty={form.formState.isDirty || hasMediaChanges}
            disabled={isBusy}
            className="flex-1"
            label={existsInDb ? "Update archive" : "Create archive"}
            watchFields={[
              "text_title",
              "text_description",
              "video_alt",
              "image_alt",
            ]}
          />
          {existsInDb ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy}
              onClick={handleDeleteArchive}
              aria-label={`Delete archive ${year}`}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
};
