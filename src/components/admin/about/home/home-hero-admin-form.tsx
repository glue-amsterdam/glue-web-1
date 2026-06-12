"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageIcon, VideoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { config } from "@/config";
import { homeHeroSchema, type HomeHero } from "@/schemas/homeHeroSchema";
import {
  deleteImage,
  isAcceptedVideoFile,
  MAX_HERO_VIDEO_BYTES,
  uploadImage,
  uploadVideo,
} from "@/utils/supabase/storage/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createUploadProgressHandler,
  ImageUploadOverlay,
  type UploadState,
} from "@/components/image-upload-overlay";
import { saveHomeHero } from "@/app/actions/admin/home";

type Props = {
  initialData: HomeHero;
};

const isStoredMediaUrl = (url: string): boolean =>
  Boolean(url) && !url.startsWith("blob:");

const tryDeleteStoredFile = async (url: string): Promise<void> => {
  const { error } = await deleteImage(url);
  if (error) {
    console.warn("[home-hero] Failed to delete previous file:", error);
  }
};

const HomeHeroAdminForm = ({ initialData }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUploadState, setVideoUploadState] = useState<UploadState | null>(
    null
  );
  const [posterUploadState, setPosterUploadState] = useState<UploadState | null>(
    null
  );
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingPosterFile, setPendingPosterFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(initialData.video_url);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState(
    initialData.poster_url
  );
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<HomeHero>({
    resolver: zodResolver(homeHeroSchema),
    defaultValues: initialData,
  });

  const { handleSubmit, reset, formState } = methods;
  const hasMediaChanges = Boolean(pendingVideoFile || pendingPosterFile);
  const isBusy = Boolean(
    isSubmitting || videoUploadState || posterUploadState
  );

  useEffect(() => {
    reset(initialData);
    setVideoPreviewUrl(initialData.video_url);
    setPosterPreviewUrl(initialData.poster_url);
    setPendingVideoFile(null);
    setPendingPosterFile(null);
  }, [initialData, reset]);

  useEffect(() => {
    if (!pendingVideoFile) return;
    const objectUrl = URL.createObjectURL(pendingVideoFile);
    setVideoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingVideoFile]);

  useEffect(() => {
    if (!pendingPosterFile) return;
    const objectUrl = URL.createObjectURL(pendingPosterFile);
    setPosterPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingPosterFile]);

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    if (!file) return;

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

  const onSubmit = async (data: HomeHero) => {
    setIsSubmitting(true);

    try {
      let videoUrl = data.video_url;
      let posterUrl = data.poster_url;

      if (pendingPosterFile) {
        setPosterUploadState({ stage: "deleting", progress: 10 });

        if (isStoredMediaUrl(data.poster_url)) {
          await tryDeleteStoredFile(data.poster_url);
        }

        setPosterUploadState({ stage: "compressing", progress: 20 });

        const { imageUrl, error } = await uploadImage({
          file: pendingPosterFile,
          bucket: config.bucketName,
          folder: "home-hero/posters",
          maxSizeMB: 2,
          onProgress: createUploadProgressHandler(setPosterUploadState),
        });

        if (error) {
          throw new Error(error);
        }

        posterUrl = imageUrl;
        setPosterUploadState(null);
      }

      if (pendingVideoFile) {
        setVideoUploadState({ stage: "deleting", progress: 10 });

        if (isStoredMediaUrl(data.video_url)) {
          await tryDeleteStoredFile(data.video_url);
        }

        setVideoUploadState({ stage: "uploading", progress: 20 });

        const { videoUrl: uploadedVideoUrl, error } = await uploadVideo({
          file: pendingVideoFile,
          bucket: config.bucketName,
          folder: "home-hero/videos",
          onProgress: (progress) => {
            setVideoUploadState({ stage: "uploading", progress });
          },
        });

        if (error) {
          throw new Error(error);
        }

        videoUrl = uploadedVideoUrl;
        setVideoUploadState(null);
      }

      if (pendingPosterFile || pendingVideoFile) {
        if (pendingPosterFile) {
          setPosterUploadState({ stage: "saving", progress: 98 });
        }
        if (pendingVideoFile) {
          setVideoUploadState({ stage: "saving", progress: 98 });
        }
      }

      const saved = await saveHomeHero({
        id: data.id,
        description: data.description,
        video_url: videoUrl,
        poster_url: posterUrl,
      });

      reset(saved);
      setVideoPreviewUrl(saved.video_url);
      setPosterPreviewUrl(saved.poster_url);
      setPendingVideoFile(null);
      setPendingPosterFile(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (posterInputRef.current) posterInputRef.current.value = "";

      toast({
        title: "Hero updated",
        description: "The home hero section has been successfully updated.",
      });
      router.refresh();
    } catch (error) {
      console.error("Home hero form submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update home hero. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVideoUploadState(null);
      setPosterUploadState(null);
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="hero-video">Video</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Max size 10 MB. Changes are cached until you save.
            </p>
            <div className="relative w-full max-w-2xl aspect-video rounded-md overflow-hidden border bg-muted">
              {videoPreviewUrl ? (
                <video
                  src={videoPreviewUrl}
                  controls
                  muted
                  className="h-full w-full object-cover"
                  aria-label="Home hero video preview"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <VideoIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {videoUploadState && (
                <ImageUploadOverlay
                  stage={videoUploadState.stage}
                  progress={videoUploadState.progress}
                />
              )}
            </div>
            {pendingVideoFile && !videoUploadState && (
              <p className="mt-2 text-sm text-muted-foreground">
                New file selected — save to apply
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={isBusy}
              onClick={() => videoInputRef.current?.click()}
            >
              Replace video
            </Button>
            <input
              id="hero-video"
              ref={videoInputRef}
              type="file"
              accept="video/*,.mp4,.webm,.mov"
              className="hidden"
              disabled={isBusy}
              onChange={handleVideoChange}
            />
          </div>

          <div>
            <Label htmlFor="hero-poster">Poster</Label>
            <div className="relative mt-2 w-full max-w-md aspect-video rounded-md overflow-hidden border bg-muted">
              {posterPreviewUrl ? (
                <Image
                  fill
                  src={posterPreviewUrl}
                  alt="Home hero poster preview"
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {posterUploadState && (
                <ImageUploadOverlay
                  stage={posterUploadState.stage}
                  progress={posterUploadState.progress}
                />
              )}
            </div>
            {pendingPosterFile && !posterUploadState && (
              <p className="mt-2 text-sm text-muted-foreground">
                New file selected — save to apply
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={isBusy}
              onClick={() => posterInputRef.current?.click()}
            >
              Replace poster
            </Button>
            <input
              id="hero-poster"
              ref={posterInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isBusy}
              onChange={handlePosterChange}
            />
          </div>
        </div>

        <FormField
          control={methods.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  placeholder="Hero description text"
                  aria-label="Hero description"
                  disabled={isBusy}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <SaveChangesButton
          isSubmitting={isSubmitting}
          isDirty={formState.isDirty || hasMediaChanges}
          disabled={isBusy}
          watchFields={["description"]}
        />

      </form>
    </FormProvider>
  );
};

export default HomeHeroAdminForm;
