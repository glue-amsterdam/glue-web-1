import {
  deleteImage,
  isAcceptedVideoFile,
  MAX_HERO_VIDEO_BYTES,
} from "./client";

export const isStoredMediaUrl = (url: string): boolean =>
  Boolean(url) && !url.startsWith("blob:");

export const tryDeleteStoredFile = async (url: string): Promise<void> => {
  const { error } = await deleteImage(url);
  if (error) {
    console.warn("[media-helpers] Failed to delete previous file:", error);
  }
};

type ValidateVideoFileOptions = {
  onInvalidType?: () => void;
  onTooLarge?: () => void;
};

export const validateVideoFile = (
  file: File,
  options?: ValidateVideoFileOptions
): boolean => {
  if (!isAcceptedVideoFile(file)) {
    options?.onInvalidType?.();
    return false;
  }

  if (file.size > MAX_HERO_VIDEO_BYTES) {
    options?.onTooLarge?.();
    return false;
  }

  return true;
};
