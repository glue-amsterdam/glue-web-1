"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Control } from "react-hook-form";
import { VideoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import {
  ImageUploadOverlay,
  type UploadState,
} from "@/components/image-upload-overlay";
import {
  isAcceptedVideoFile,
  MAX_HERO_VIDEO_BYTES,
} from "@/utils/supabase/storage/client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ArchiveYearMediaFormValues } from "./process-archive-year-media";

export type ArchiveYearFormValues = ArchiveYearMediaFormValues & {
  year: number;
  text_title: string;
  text_description: string;
};

export const createEmptyArchiveYearValues = (
  year: number
): ArchiveYearFormValues => ({
  year,
  media_type: null,
  video_src: "",
  video_poster: "",
  video_alt: "",
  image_src: "",
  image_alt: "",
  text_title: "",
  text_description: "",
});

type ArchiveYearMediaFieldsProps = {
  control: Control<ArchiveYearFormValues>;
  mediaType: "video" | "image" | null;
  disabled?: boolean;
  onMediaTypeChange: (value: "video" | "image" | null) => void;
  onRemoveVideo: () => void;
  onRemovePoster: () => void;
  onRemoveImage: () => void;
  onBusyChange?: (isBusy: boolean) => void;
  onHasMediaChangesChange?: (hasChanges: boolean) => void;
};

export const useArchiveYearMediaState = () => {
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingPosterFile, setPendingPosterFile] = useState<File | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [posterPreviewUrl, setPosterPreviewUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [videoUploadState, setVideoUploadState] = useState<UploadState | null>(
    null
  );
  const [posterUploadState, setPosterUploadState] = useState<UploadState | null>(
    null
  );
  const [imageUploadState, setImageUploadState] = useState<UploadState | null>(
    null
  );
  const [urlsMarkedForDeletion, setUrlsMarkedForDeletion] = useState<string[]>(
    []
  );
  const [removedVideo, setRemovedVideo] = useState(false);
  const [removedPoster, setRemovedPoster] = useState(false);
  const [removedImage, setRemovedImage] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const hasMediaChanges = Boolean(
    pendingVideoFile ||
      pendingPosterFile ||
      pendingImageFile ||
      urlsMarkedForDeletion.length > 0 ||
      removedVideo ||
      removedPoster ||
      removedImage
  );
  const isBusy = Boolean(
    videoUploadState || posterUploadState || imageUploadState
  );

  const markUrlForDeletion = useCallback((url: string | undefined) => {
    if (typeof url !== "string" || !url || url.startsWith("blob:")) {
      return;
    }

    setUrlsMarkedForDeletion((current) =>
      current.includes(url) ? current : [...current, url]
    );
  }, []);

  const syncFromValues = useCallback((values: ArchiveYearMediaFormValues) => {
    setVideoPreviewUrl(values.video_src ?? "");
    setPosterPreviewUrl(values.video_poster ?? "");
    setImagePreviewUrl(values.image_src ?? "");
    setPendingVideoFile(null);
    setPendingPosterFile(null);
    setPendingImageFile(null);
    setUrlsMarkedForDeletion([]);
    setRemovedVideo(false);
    setRemovedPoster(false);
    setRemovedImage(false);
    setVideoUploadState(null);
    setPosterUploadState(null);
    setImageUploadState(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (posterInputRef.current) posterInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  const clearPendingFiles = useCallback(() => {
    setPendingVideoFile(null);
    setPendingPosterFile(null);
    setPendingImageFile(null);
    setUrlsMarkedForDeletion([]);
    setRemovedVideo(false);
    setRemovedPoster(false);
    setRemovedImage(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (posterInputRef.current) posterInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, []);

  const removeVideoPreview = useCallback(
    (storedUrl: string | undefined) => {
      markUrlForDeletion(storedUrl);
      setPendingVideoFile(null);
      setVideoPreviewUrl("");
      setRemovedVideo(true);
      if (videoInputRef.current) videoInputRef.current.value = "";
    },
    [markUrlForDeletion]
  );

  const removePosterPreview = useCallback(
    (storedUrl: string | undefined) => {
      markUrlForDeletion(storedUrl);
      setPendingPosterFile(null);
      setPosterPreviewUrl("");
      setRemovedPoster(true);
      if (posterInputRef.current) posterInputRef.current.value = "";
    },
    [markUrlForDeletion]
  );

  const removeImagePreview = useCallback(
    (storedUrl: string | undefined) => {
      markUrlForDeletion(storedUrl);
      setPendingImageFile(null);
      setImagePreviewUrl("");
      setRemovedImage(true);
      if (imageInputRef.current) imageInputRef.current.value = "";
    },
    [markUrlForDeletion]
  );

  useEffect(() => {
    if (!pendingVideoFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(pendingVideoFile);
    setVideoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingVideoFile]);

  useEffect(() => {
    if (!pendingPosterFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(pendingPosterFile);
    setPosterPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingPosterFile]);

  useEffect(() => {
    if (!pendingImageFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(pendingImageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingImageFile]);

  return {
    pendingVideoFile,
    pendingPosterFile,
    pendingImageFile,
    setPendingVideoFile,
    setPendingPosterFile,
    setPendingImageFile,
    videoPreviewUrl,
    posterPreviewUrl,
    imagePreviewUrl,
    videoUploadState,
    posterUploadState,
    imageUploadState,
    setVideoUploadState,
    setPosterUploadState,
    setImageUploadState,
    videoInputRef,
    posterInputRef,
    imageInputRef,
    hasMediaChanges,
    isBusy,
    urlsMarkedForDeletion,
    removedVideo,
    removedPoster,
    removedImage,
    syncFromValues,
    clearPendingFiles,
    removeVideoPreview,
    removePosterPreview,
    removeImagePreview,
  };
};

export const ArchiveYearMediaFields = ({
  control,
  mediaType,
  disabled = false,
  onMediaTypeChange,
  onRemoveVideo,
  onRemovePoster,
  onRemoveImage,
  onBusyChange,
  onHasMediaChangesChange,
  mediaState,
}: ArchiveYearMediaFieldsProps & {
  mediaState: ReturnType<typeof useArchiveYearMediaState>;
}) => {
  const { toast } = useToast();
  const {
    pendingVideoFile,
    pendingPosterFile,
    pendingImageFile,
    setPendingVideoFile,
    setPendingPosterFile,
    setPendingImageFile,
    videoPreviewUrl,
    posterPreviewUrl,
    imagePreviewUrl,
    videoUploadState,
    posterUploadState,
    imageUploadState,
    videoInputRef,
    posterInputRef,
    imageInputRef,
    hasMediaChanges,
    isBusy,
    removedVideo,
    removedPoster,
    removedImage,
    removeVideoPreview,
    removePosterPreview,
    removeImagePreview,
  } = mediaState;

  const isDisabled = disabled || isBusy;

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  useEffect(() => {
    onHasMediaChangesChange?.(hasMediaChanges);
  }, [hasMediaChanges, onHasMediaChangesChange]);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!isAcceptedVideoFile(file)) {
      toast({
        title: "Invalid file",
        description: "Please select a video file (.mp4, .webm, or .mov).",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_HERO_VIDEO_BYTES) {
      toast({
        title: "Video too large",
        description: "Video must be 10 MB or smaller.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setPendingVideoFile(file);
  };

  const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setPendingPosterFile(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setPendingImageFile(file);
  };

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Media Type</FormLabel>
        <FormControl>
          <select
            className="w-full rounded border px-2 py-1"
            value={mediaType ?? ""}
            disabled={isDisabled}
            onChange={(event) =>
              onMediaTypeChange(
                event.target.value === ""
                  ? null
                  : (event.target.value as "video" | "image")
              )
            }
            aria-label="Archive media type"
          >
            <option value="">None</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </FormControl>
      </FormItem>

      {mediaType === "video" ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Video</p>
            <p className="mb-2 text-sm text-muted-foreground">
              Max size 10 MB. Changes apply when you save.
            </p>
            <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-md border bg-muted">
              {videoPreviewUrl ? (
                <video
                  src={videoPreviewUrl}
                  controls
                  muted
                  className="h-full w-full object-cover"
                  aria-label="Archive year video preview"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <VideoIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {videoUploadState ? (
                <ImageUploadOverlay
                  stage={videoUploadState.stage}
                  progress={videoUploadState.progress}
                />
              ) : null}
            </div>
            {pendingVideoFile && !videoUploadState ? (
              <p className="mt-2 text-sm text-muted-foreground">
                New file selected — save to apply
              </p>
            ) : null}
            {removedVideo && !pendingVideoFile ? (
              <p className="mt-2 text-sm text-amber-700">
                Video will be removed when you save
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDisabled}
                onClick={() => videoInputRef.current?.click()}
              >
                Replace video
              </Button>
              {(videoPreviewUrl || pendingVideoFile) && !removedVideo ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDisabled}
                  onClick={onRemoveVideo}
                  aria-label="Remove archive video"
                >
                  Remove video
                </Button>
              ) : null}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,.mp4,.webm,.mov"
              className="hidden"
              disabled={isDisabled}
              onChange={handleVideoChange}
              aria-label="Select archive video"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Poster</p>
            <AdminImagePreview
              src={posterPreviewUrl}
              alt="Archive year video poster preview"
              uploadState={posterUploadState}
              aspectClassName="aspect-video w-full max-w-md"
            />
            {pendingPosterFile && !posterUploadState ? (
              <p className="mt-2 text-sm text-muted-foreground">
                New file selected — save to apply
              </p>
            ) : null}
            {removedPoster && !pendingPosterFile ? (
              <p className="mt-2 text-sm text-amber-700">
                Poster will be removed when you save
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDisabled}
                onClick={() => posterInputRef.current?.click()}
              >
                Replace poster
              </Button>
              {(posterPreviewUrl || pendingPosterFile) && !removedPoster ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDisabled}
                  onClick={onRemovePoster}
                  aria-label="Remove archive video poster"
                >
                  Remove poster
                </Button>
              ) : null}
            </div>
            <input
              ref={posterInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isDisabled}
              onChange={handlePosterChange}
              aria-label="Select archive video poster"
            />
          </div>

          <FormField
            control={control}
            name="video_alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video alt text</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isDisabled}
                    placeholder={`GLUE archive video`}
                    aria-label="Video alt text"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ) : null}

      {mediaType === "image" ? (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Image</p>
            <AdminImagePreview
              src={imagePreviewUrl}
              alt="Archive year image preview"
              uploadState={imageUploadState}
              aspectClassName="aspect-video w-full max-w-md"
            />
            {pendingImageFile && !imageUploadState ? (
              <p className="mt-2 text-sm text-muted-foreground">
                New file selected — save to apply
              </p>
            ) : null}
            {removedImage && !pendingImageFile ? (
              <p className="mt-2 text-sm text-amber-700">
                Image will be removed when you save
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDisabled}
                onClick={() => imageInputRef.current?.click()}
              >
                Replace image
              </Button>
              {(imagePreviewUrl || pendingImageFile) && !removedImage ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDisabled}
                  onClick={onRemoveImage}
                  aria-label="Remove archive image"
                >
                  Remove image
                </Button>
              ) : null}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isDisabled}
              onChange={handleImageChange}
              aria-label="Select archive image"
            />
          </div>

          <FormField
            control={control}
            name="image_alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image alt text</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled={isDisabled}
                    placeholder="GLUE archive image"
                    aria-label="Image alt text"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ) : null}
    </div>
  );
};
