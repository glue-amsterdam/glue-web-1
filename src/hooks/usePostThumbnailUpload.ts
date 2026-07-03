"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { patchPost } from "@/app/actions/admin/posts";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config";
import { uploadImage } from "@/utils/supabase/storage/client";

type UsePostThumbnailUploadOptions = {
  postId: string;
  initialThumbnail: string | null;
  onSaved?: (thumbnailUrl: string | null) => void;
};

export const usePostThumbnailUpload = ({
  postId,
  initialThumbnail,
  onSaved,
}: UsePostThumbnailUploadOptions) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialThumbnail);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  useEffect(() => {
    setPreviewUrl(initialThumbnail);
  }, [initialThumbnail]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) {
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setUploadState({ stage: "compressing", progress: 5 });

      try {
        const { key, imageUrl, error } = await uploadImage({
          file,
          bucket: config.bucketName,
          folder: "posts/thumbnails",
          onProgress: handleUploadProgress,
        });

        if (error || !key) {
          throw new Error(error || "Upload failed");
        }

        setUploadState({ stage: "saving", progress: 96 });
        await patchPost(postId, { thumbnail: key });

        setPreviewUrl(imageUrl);
        onSaved?.(imageUrl);
        toast({
          title: "Thumbnail saved",
          description: "The post thumbnail was uploaded successfully.",
        });
      } catch (error) {
        setPreviewUrl(initialThumbnail);
        toast({
          title: "Upload failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not upload the thumbnail.",
          variant: "destructive",
        });
      } finally {
        setUploadState(null);
      }
    },
    [handleUploadProgress, initialThumbnail, onSaved, postId, toast]
  );

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);

    try {
      await patchPost(postId, { thumbnail: null });
      setPreviewUrl(null);
      onSaved?.(null);
      toast({
        title: "Thumbnail removed",
        description: "The post thumbnail was removed.",
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not remove the thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  }, [onSaved, postId, toast]);

  const isBusy = uploadState !== null || isRemoving;

  return {
    previewUrl,
    uploadState,
    fileInputRef,
    isBusy,
    isRemoving,
    openFilePicker,
    handleFileSelect,
    handleRemove,
  };
};
