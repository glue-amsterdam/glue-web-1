"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { notifyParticipantPlaceholderUpdated } from "@/app/actions/admin/main";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config";
import { PARTICIPANT_PLACEHOLDER_PATH } from "@/lib/participants/get-participant-placeholder-url";
import { uploadImageToFixedPath } from "@/utils/supabase/storage/client";

const PLACEHOLDER_MAX_SIZE_MB = 0.25;
const PLACEHOLDER_MAX_WIDTH_OR_HEIGHT = 900;

type UseParticipantPlaceholderUploadOptions = {
  initialPlaceholderUrl: string;
  onSaved?: (placeholderUrl: string) => void;
};

export const useParticipantPlaceholderUpload = ({
  initialPlaceholderUrl,
  onSaved,
}: UseParticipantPlaceholderUploadOptions) => {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipInitialSyncRef = useRef(false);
  const [previewUrl, setPreviewUrl] = useState(initialPlaceholderUrl);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  useEffect(() => {
    if (skipInitialSyncRef.current) {
      skipInitialSyncRef.current = false;
      return;
    }
    setPreviewUrl(initialPlaceholderUrl);
  }, [initialPlaceholderUrl]);

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

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setUploadState({ stage: "compressing", progress: 5 });

      try {
        const { imageUrl, error } = await uploadImageToFixedPath({
          file,
          bucket: config.bucketName,
          path: PARTICIPANT_PLACEHOLDER_PATH,
          maxSizeMB: PLACEHOLDER_MAX_SIZE_MB,
          maxWidthOrHeight: PLACEHOLDER_MAX_WIDTH_OR_HEIGHT,
          fileType: "image/jpeg",
          onProgress: handleUploadProgress,
        });

        if (error || !imageUrl) {
          throw new Error(error || "Upload failed");
        }

        setUploadState({ stage: "saving", progress: 96 });
        const freshUrl = await notifyParticipantPlaceholderUpdated();

        URL.revokeObjectURL(localPreview);
        skipInitialSyncRef.current = true;
        setPreviewUrl(freshUrl);
        onSaved?.(freshUrl);
        toast({
          title: "Placeholder updated",
          description:
            "The participant placeholder image was uploaded successfully.",
        });
        router.refresh();
      } catch (error) {
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(initialPlaceholderUrl);
        toast({
          title: "Upload failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not upload the placeholder image.",
          variant: "destructive",
        });
      } finally {
        setUploadState(null);
      }
    },
    [handleUploadProgress, initialPlaceholderUrl, onSaved, router, toast]
  );

  const isBusy = uploadState !== null;

  return {
    previewUrl,
    uploadState,
    fileInputRef,
    isBusy,
    openFilePicker,
    handleFileSelect,
  };
};
