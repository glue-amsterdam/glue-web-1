import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import { createClient } from "@/utils/supabase/client";

// storage-js builds the header as `max-age=${cacheControl}`, so pass only the
// seconds value. UUID paths make each upload effectively immutable (1 year).
const STORAGE_IMMUTABLE_CACHE_CONTROL = "31536000";

// Content invalidation is handled by admin revalidate*Cache tags and new UUID paths.
function getStorage() {
  const { storage } = createClient();
  return storage;
}

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  onProgress?: (progress: number) => void;
};

export const uploadImage = async ({
  file,
  bucket,
  folder,
  maxSizeMB = 2,
  maxWidthOrHeight = 1920,
  onProgress,
}: UploadProps) => {
  console.log("uploadImage called with:", { bucket, folder, maxSizeMB });

  if (!file || !bucket) {
    console.error("Missing file or bucket:", { file: !!file, bucket });
    return { imageUrl: "", error: "Missing file or bucket" };
  }

  const fileName = file.name;
  const fileExtension = fileName.slice(
    ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
  );
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  console.log("Generated path:", path);

  try {
    file = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      onProgress: (progress) => {
        onProgress?.(Math.round(progress * 0.85));
      },
    });
    console.log("Image compressed successfully");
  } catch (error) {
    console.error("Image compression failed:", error);
    return { imageUrl: "", error: "Image compression failed" };
  }

  onProgress?.(88);

  const storage = getStorage();

  if (!storage) {
    console.error("Storage not initialized");
    return { imageUrl: "", error: "Storage not initialized" };
  }

  console.log("Uploading to storage:", { bucket, path });
  const { data, error } = await storage.from(bucket).upload(path, file, {
    cacheControl: STORAGE_IMMUTABLE_CACHE_CONTROL,
  });

  if (error) {
    console.error("Image upload failed:", error);
    return { imageUrl: "", error: `Image upload failed: ${error.message}` };
  }

  if (!data?.path) {
    console.error("No path returned from upload");
    return { imageUrl: "", error: "No path returned from upload" };
  }

  onProgress?.(95);

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  console.log("Generated image URL:", imageUrl);

  return { imageUrl, error: "" };
};

export const MAX_HERO_VIDEO_BYTES = 10 * 1024 * 1024;

const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"] as const;

export const isAcceptedVideoFile = (file: File): boolean => {
  if (file.type.startsWith("video/")) {
    return true;
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ACCEPTED_VIDEO_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_VIDEO_EXTENSIONS)[number]
  );
};

type UploadVideoProps = {
  file: File;
  bucket: string;
  folder?: string;
  maxBytes?: number;
  onProgress?: (progress: number) => void;
};

export const uploadVideo = async ({
  file,
  bucket,
  folder,
  maxBytes = MAX_HERO_VIDEO_BYTES,
  onProgress,
}: UploadVideoProps) => {
  if (!file || !bucket) {
    return { videoUrl: "", error: "Missing file or bucket" };
  }

  if (file.size > maxBytes) {
    return {
      videoUrl: "",
      error: "Video must be 10 MB or smaller",
    };
  }

  if (!isAcceptedVideoFile(file)) {
    return { videoUrl: "", error: "File must be a video" };
  }

  const fileName = file.name;
  const fileExtension = fileName.slice(
    ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
  );
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  const storage = getStorage();

  if (!storage) {
    return { videoUrl: "", error: "Storage not initialized" };
  }

  onProgress?.(10);

  const { data, error } = await storage.from(bucket).upload(path, file, {
    cacheControl: STORAGE_IMMUTABLE_CACHE_CONTROL,
  });

  if (error) {
    return { videoUrl: "", error: `Video upload failed: ${error.message}` };
  }

  if (!data?.path) {
    return { videoUrl: "", error: "No path returned from upload" };
  }

  onProgress?.(95);

  const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;

  return { videoUrl, error: "" };
};

export const deleteImage = async (imageUrl: string) => {
  if (!imageUrl) {
    return { data: null, error: "No image URL provided" };
  }

  const storage = getStorage();

  if (!storage) {
    return { data: null, error: "Storage not initialized" };
  }

  const bucketAndPathString = imageUrl.split("/storage/v1/object/public/")[1];
  if (!bucketAndPathString) {
    return { data: null, error: "Invalid image URL" };
  }

  const firstSlashIndex = bucketAndPathString.indexOf("/");
  if (firstSlashIndex === -1) {
    return { data: null, error: "Invalid image URL format" };
  }

  const bucket = bucketAndPathString.slice(0, firstSlashIndex);
  const path = bucketAndPathString.slice(firstSlashIndex + 1);

  const { data, error } = await storage.from(bucket).remove([path]);

  return { data, error };
};
