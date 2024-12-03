import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";
import { createClient } from "@/utils/supabase/client";

function getStorage() {
  const { storage } = createClient();
  return storage;
}

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
};

export const uploadImage = async ({ file, bucket, folder }: UploadProps) => {
  if (!file || !bucket) {
    return { imageUrl: "", error: "Missing file or bucket" };
  }

  const fileName = file.name;
  const fileExtension = fileName.slice(
    ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
  );
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  try {
    file = await imageCompression(file, {
      maxSizeMB: 2,
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    return { imageUrl: "", error: "Image compression failed" };
  }

  const storage = getStorage();

  if (!storage) {
    return { imageUrl: "", error: "Storage not initialized" };
  }

  const { data, error } = await storage.from(bucket).upload(path, file);

  if (error) {
    console.error("Image upload failed:", error);
    return { imageUrl: "", error: "Image upload failed" };
  }

  if (!data?.path) {
    return { imageUrl: "", error: "No path returned from upload" };
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;

  return { imageUrl, error: "" };
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
