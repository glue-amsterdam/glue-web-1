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
  MAX_HERO_DESKTOP_VIDEO_BYTES,
  MAX_HERO_MOBILE_VIDEO_BYTES,
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

type VideoPreviewVariant = "desktop" | "mobile";

type VideoSlotProps = {
  id: string;
  label: string;
  variant: VideoPreviewVariant;
  previewUrl: string;
  uploadState: UploadState | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isBusy: boolean;
  onReplaceClick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const previewFrameClassName: Record<VideoPreviewVariant, string> = {
  desktop:
    "relative aspect-video w-full max-w-2xl overflow-hidden rounded-md border bg-muted",
  mobile:
    "relative h-[413px] w-full max-w-[320px] overflow-hidden rounded-md border bg-muted",
};

const HeroVideoUploadSlot = ({
  id,
  label,
  variant,
  previewUrl,
  uploadState,
  inputRef,
  isBusy,
  onReplaceClick,
  onFileChange,
}: VideoSlotProps) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <div className={`mt-2 ${previewFrameClassName[variant]}`}>
      {previewUrl ? (
        <video
          src={previewUrl}
          controls
          muted
          className="h-full w-full object-cover"
          aria-label={`${label} preview`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <VideoIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      {uploadState && (
        <ImageUploadOverlay
          stage={uploadState.stage}
          progress={uploadState.progress}
        />
      )}
    </div>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2"
      disabled={isBusy}
      onClick={onReplaceClick}
    >
      Replace video
    </Button>
    <input
      id={id}
      ref={inputRef}
      type="file"
      accept="video/*,.mp4,.webm,.mov"
      className="hidden"
      disabled={isBusy}
      onChange={onFileChange}
    />
  </div>
);

const HomeHeroAdminForm = ({ initialData }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [desktopVideoUploadState, setDesktopVideoUploadState] =
    useState<UploadState | null>(null);
  const [mobileVideoUploadState, setMobileVideoUploadState] =
    useState<UploadState | null>(null);
  const [posterUploadState, setPosterUploadState] = useState<UploadState | null>(
    null
  );
  const [pendingDesktopVideoFile, setPendingDesktopVideoFile] =
    useState<File | null>(null);
  const [pendingMobileVideoFile, setPendingMobileVideoFile] =
    useState<File | null>(null);
  const [pendingPosterFile, setPendingPosterFile] = useState<File | null>(null);
  const [desktopVideoPreviewUrl, setDesktopVideoPreviewUrl] = useState(
    initialData.video_url
  );
  const [mobileVideoPreviewUrl, setMobileVideoPreviewUrl] = useState(
    initialData.video_url_mobile || ""
  );
  const [posterPreviewUrl, setPosterPreviewUrl] = useState(
    initialData.poster_url
  );
  const desktopVideoInputRef = useRef<HTMLInputElement>(null);
  const mobileVideoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<HomeHero>({
    resolver: zodResolver(homeHeroSchema),
    defaultValues: {
      ...initialData,
      video_url_mobile: initialData.video_url_mobile || "",
    },
  });

  const { handleSubmit, reset, formState } = methods;
  const hasMediaChanges = Boolean(
    pendingDesktopVideoFile || pendingMobileVideoFile || pendingPosterFile
  );
  const isBusy = Boolean(
    isSubmitting ||
      desktopVideoUploadState ||
      mobileVideoUploadState ||
      posterUploadState
  );

  useEffect(() => {
    reset({
      ...initialData,
      video_url_mobile: initialData.video_url_mobile || "",
    });
    setDesktopVideoPreviewUrl(initialData.video_url);
    setMobileVideoPreviewUrl(initialData.video_url_mobile || "");
    setPosterPreviewUrl(initialData.poster_url);
    setPendingDesktopVideoFile(null);
    setPendingMobileVideoFile(null);
    setPendingPosterFile(null);
  }, [initialData, reset]);

  useEffect(() => {
    if (!pendingDesktopVideoFile) return;
    const objectUrl = URL.createObjectURL(pendingDesktopVideoFile);
    setDesktopVideoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingDesktopVideoFile]);

  useEffect(() => {
    if (!pendingMobileVideoFile) return;
    const objectUrl = URL.createObjectURL(pendingMobileVideoFile);
    setMobileVideoPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingMobileVideoFile]);

  useEffect(() => {
    if (!pendingPosterFile) return;
    const objectUrl = URL.createObjectURL(pendingPosterFile);
    setPosterPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingPosterFile]);

  const handleValidateVideoFile = (
    file: File,
    event: React.ChangeEvent<HTMLInputElement>,
    maxBytes: number
  ): boolean => {
    if (!isAcceptedVideoFile(file)) {
      toast({
        title: "Invalid file",
        description: "Please select a video file (.mp4, .webm, or .mov).",
        variant: "destructive",
      });
      event.target.value = "";
      return false;
    }

    if (file.size > maxBytes) {
      const maxMb = Math.round(maxBytes / (1024 * 1024));
      toast({
        title: "Video too large",
        description: `Video must be ${maxMb} MB or smaller.`,
        variant: "destructive",
      });
      event.target.value = "";
      return false;
    }

    return true;
  };

  const handleDesktopVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!handleValidateVideoFile(file, event, MAX_HERO_DESKTOP_VIDEO_BYTES)) {
      return;
    }
    setPendingDesktopVideoFile(file);
  };

  const handleMobileVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!handleValidateVideoFile(file, event, MAX_HERO_MOBILE_VIDEO_BYTES)) {
      return;
    }
    setPendingMobileVideoFile(file);
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

  const uploadHeroVideo = async ({
    file,
    previousUrl,
    maxBytes,
    setUploadState,
  }: {
    file: File;
    previousUrl: string;
    maxBytes: number;
    setUploadState: (state: UploadState | null) => void;
  }): Promise<string> => {
    setUploadState({ stage: "deleting", progress: 10 });

    if (isStoredMediaUrl(previousUrl)) {
      await tryDeleteStoredFile(previousUrl);
    }

    setUploadState({ stage: "uploading", progress: 20 });

    const { videoUrl: uploadedVideoUrl, error } = await uploadVideo({
      file,
      bucket: config.bucketName,
      folder: "home-hero/videos",
      maxBytes,
      onProgress: (progress) => {
        setUploadState({ stage: "uploading", progress });
      },
    });

    if (error || !uploadedVideoUrl) {
      throw new Error(error || "Video upload failed");
    }

    setUploadState(null);
    return uploadedVideoUrl;
  };

  const onSubmit = async (data: HomeHero) => {
    setIsSubmitting(true);

    try {
      let desktopVideoUrl = data.video_url;
      let mobileVideoUrl = data.video_url_mobile || "";
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

      if (pendingDesktopVideoFile) {
        desktopVideoUrl = await uploadHeroVideo({
          file: pendingDesktopVideoFile,
          previousUrl: data.video_url,
          maxBytes: MAX_HERO_DESKTOP_VIDEO_BYTES,
          setUploadState: setDesktopVideoUploadState,
        });
      }

      if (pendingMobileVideoFile) {
        mobileVideoUrl = await uploadHeroVideo({
          file: pendingMobileVideoFile,
          previousUrl: data.video_url_mobile || "",
          maxBytes: MAX_HERO_MOBILE_VIDEO_BYTES,
          setUploadState: setMobileVideoUploadState,
        });
      }

      if (
        pendingPosterFile ||
        pendingDesktopVideoFile ||
        pendingMobileVideoFile
      ) {
        if (pendingPosterFile) {
          setPosterUploadState({ stage: "saving", progress: 98 });
        }
        if (pendingDesktopVideoFile) {
          setDesktopVideoUploadState({ stage: "saving", progress: 98 });
        }
        if (pendingMobileVideoFile) {
          setMobileVideoUploadState({ stage: "saving", progress: 98 });
        }
      }

      const saved = await saveHomeHero({
        id: data.id,
        description: data.description,
        video_url: desktopVideoUrl,
        video_url_mobile: mobileVideoUrl,
        poster_url: posterUrl,
      });

      reset(saved);
      setDesktopVideoPreviewUrl(saved.video_url);
      setMobileVideoPreviewUrl(saved.video_url_mobile || "");
      setPosterPreviewUrl(saved.poster_url);
      setPendingDesktopVideoFile(null);
      setPendingMobileVideoFile(null);
      setPendingPosterFile(null);
      if (desktopVideoInputRef.current) desktopVideoInputRef.current.value = "";
      if (mobileVideoInputRef.current) mobileVideoInputRef.current.value = "";
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
      setDesktopVideoUploadState(null);
      setMobileVideoUploadState(null);
      setPosterUploadState(null);
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <aside className="space-y-6 border-t pt-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">Desktop</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">
                  Recommended weight:
                </span>{" "}
                5–10 MB
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Maximum weight:
                </span>{" "}
                15–20 MB
              </li>
              <li>
                <span className="font-medium text-foreground">Why?</span> The
                Hero is one of the first elements users see, so keeping the
                video lightweight helps the homepage load quickly and keeps the
                initial experience smooth. Since it is a prominent visual
                element, we can allow a larger file than on mobile, while still
                avoiding unnecessary page weight.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">Mobile</h4>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">
                  Recommended weight:
                </span>{" "}
                2–5 MB
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Maximum weight:
                </span>{" "}
                8–10 MB
              </li>
              <li>
                <span className="font-medium text-foreground">Why?</span> On
                mobile, a heavier video means more data has to be downloaded by
                the user, which can be especially relevant when using mobile
                data. Keeping the file smaller reduces data consumption and
                helps avoid making the homepage feel slow or heavy, while still
                maintaining the intended visual impact.
              </li>
            </ul>
          </div>
        </aside>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <div className="space-y-8">
          <section className="space-y-4" aria-labelledby="hero-desktop-heading">
            <HeroVideoUploadSlot
              id="hero-video-desktop"
              label="Desktop video"
              variant="desktop"
              previewUrl={desktopVideoPreviewUrl}
              uploadState={desktopVideoUploadState}
              inputRef={desktopVideoInputRef}
              isBusy={isBusy}
              onReplaceClick={() => desktopVideoInputRef.current?.click()}
              onFileChange={handleDesktopVideoChange}
            />

            <div>
              <Label htmlFor="hero-poster">Poster</Label>
              <div className="relative mt-2 aspect-video w-full max-w-md overflow-hidden rounded-md border bg-muted">
                {posterPreviewUrl ? (
                  <Image
                    fill
                    src={posterPreviewUrl}
                    alt="Home hero desktop poster preview"
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
          </section>

          <section className="space-y-4" aria-labelledby="hero-mobile-heading">
            <h3
              id="hero-mobile-heading"
              className="text-base font-semibold tracking-tight"
            >
              Mobile
            </h3>

            <HeroVideoUploadSlot
              id="hero-video-mobile"
              label="Mobile video"
              variant="mobile"
              previewUrl={mobileVideoPreviewUrl}
              uploadState={mobileVideoUploadState}
              inputRef={mobileVideoInputRef}
              isBusy={isBusy}
              onReplaceClick={() => mobileVideoInputRef.current?.click()}
              onFileChange={handleMobileVideoChange}
            />
          </section>
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
