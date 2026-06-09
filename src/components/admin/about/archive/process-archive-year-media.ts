import { config } from "@/config";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import {
  deleteImage,
  uploadImage,
  uploadVideo,
} from "@/utils/supabase/storage/client";

export type ArchiveYearMediaFormValues = {
  media_type: "video" | "image" | null;
  video_src?: string;
  video_poster?: string;
  video_alt?: string;
  image_src?: string;
  image_alt?: string;
};

export type PendingArchiveMedia = {
  videoFile: File | null;
  posterFile: File | null;
  imageFile: File | null;
};

type UploadStateSetter = (state: UploadState | null) => void;

type ProcessArchiveYearMediaOptions = {
  data: ArchiveYearMediaFormValues;
  pending: PendingArchiveMedia;
  urlsMarkedForDeletion: string[];
  previousMediaType: "video" | "image" | null;
  setVideoUploadState: UploadStateSetter;
  setPosterUploadState: UploadStateSetter;
  setImageUploadState: UploadStateSetter;
};

const isStoredMediaUrl = (url: string | undefined): url is string =>
  typeof url === "string" && url.length > 0 && !url.startsWith("blob:");

const tryDeleteStoredFile = async (url: string | undefined): Promise<void> => {
  if (!isStoredMediaUrl(url)) {
    return;
  }

  const { error } = await deleteImage(url);
  if (error) {
    console.warn("[archive-year] Failed to delete previous file:", error);
  }
};

const clearVideoFields = (
  values: ArchiveYearMediaFormValues
): ArchiveYearMediaFormValues => ({
  ...values,
  video_src: "",
  video_poster: "",
  video_alt: "",
});

const clearImageFields = (
  values: ArchiveYearMediaFormValues
): ArchiveYearMediaFormValues => ({
  ...values,
  image_src: "",
  image_alt: "",
});

export const processArchiveYearMediaUpload = async ({
  data,
  pending,
  urlsMarkedForDeletion,
  previousMediaType,
  setVideoUploadState,
  setPosterUploadState,
  setImageUploadState,
}: ProcessArchiveYearMediaOptions): Promise<ArchiveYearMediaFormValues> => {
  let result: ArchiveYearMediaFormValues = { ...data };

  for (const url of urlsMarkedForDeletion) {
    await tryDeleteStoredFile(url);
  }

  if (data.media_type === null) {
    await tryDeleteStoredFile(result.video_src);
    await tryDeleteStoredFile(result.video_poster);
    await tryDeleteStoredFile(result.image_src);
    result = clearVideoFields(clearImageFields(result));
    return result;
  }

  if (previousMediaType === "video" && data.media_type !== "video") {
    await tryDeleteStoredFile(result.video_src);
    await tryDeleteStoredFile(result.video_poster);
    result = clearVideoFields(result);
  }

  if (previousMediaType === "image" && data.media_type !== "image") {
    await tryDeleteStoredFile(result.image_src);
    result = clearImageFields(result);
  }

  if (data.media_type === "video") {
    if (pending.posterFile) {
      setPosterUploadState({ stage: "deleting", progress: 10 });

      if (isStoredMediaUrl(result.video_poster)) {
        await tryDeleteStoredFile(result.video_poster);
      }

      setPosterUploadState({ stage: "compressing", progress: 20 });

      const { imageUrl, error } = await uploadImage({
        file: pending.posterFile,
        bucket: config.bucketName,
        folder: "about/archive/posters",
        maxSizeMB: 2,
        onProgress: createUploadProgressHandler(setPosterUploadState),
      });

      if (error) {
        throw new Error(error);
      }

      result.video_poster = imageUrl;
      setPosterUploadState(null);
    }

    if (pending.videoFile) {
      setVideoUploadState({ stage: "deleting", progress: 10 });

      if (isStoredMediaUrl(result.video_src)) {
        await tryDeleteStoredFile(result.video_src);
      }

      setVideoUploadState({ stage: "uploading", progress: 20 });

      const { videoUrl, error } = await uploadVideo({
        file: pending.videoFile,
        bucket: config.bucketName,
        folder: "about/archive/videos",
        onProgress: (progress) => {
          setVideoUploadState({ stage: "uploading", progress });
        },
      });

      if (error) {
        throw new Error(error);
      }

      result.video_src = videoUrl;
      setVideoUploadState(null);
    }
  }

  if (data.media_type === "image" && pending.imageFile) {
    setImageUploadState({ stage: "deleting", progress: 10 });

    if (isStoredMediaUrl(result.image_src)) {
      await tryDeleteStoredFile(result.image_src);
    }

    setImageUploadState({ stage: "compressing", progress: 20 });

    const { imageUrl, error } = await uploadImage({
      file: pending.imageFile,
      bucket: config.bucketName,
      folder: "about/archive/images",
      maxSizeMB: 2,
      onProgress: createUploadProgressHandler(setImageUploadState),
    });

    if (error) {
      throw new Error(error);
    }

    result.image_src = imageUrl;
    setImageUploadState(null);
  }

  if (data.media_type === "video") {
    result = clearImageFields(result);
  }

  if (data.media_type === "image") {
    result = clearVideoFields(result);
  }

  return result;
};
