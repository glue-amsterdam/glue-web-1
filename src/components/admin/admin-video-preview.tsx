"use client";

import { VideoIcon } from "lucide-react";
import {
  ImageUploadOverlay,
  type UploadState,
} from "@/components/image-upload-overlay";

type AdminVideoPreviewProps = {
  previewUrl: string;
  uploadState: UploadState | null;
  alt?: string;
  className?: string;
};

export const AdminVideoPreview = ({
  previewUrl,
  uploadState,
  alt = "Video preview",
  className = "relative aspect-video w-full max-w-md overflow-hidden rounded-md border bg-muted",
}: AdminVideoPreviewProps) => {
  return (
    <div className={className}>
      {previewUrl ? (
        <video
          src={previewUrl}
          controls
          className="h-full w-full object-contain"
          aria-label={alt}
        />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center text-muted-foreground">
          <VideoIcon className="h-10 w-10" aria-hidden="true" />
        </div>
      )}
      {uploadState ? (
        <ImageUploadOverlay
          stage={uploadState.stage}
          progress={uploadState.progress}
        />
      ) : null}
    </div>
  );
};
