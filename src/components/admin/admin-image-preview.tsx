import Image from "next/image";
import { ImageIcon } from "lucide-react";
import {
  ImageUploadOverlay,
  type UploadState,
} from "@/components/image-upload-overlay";
import { cn } from "@/lib/utils";

type AdminImagePreviewProps = {
  src?: string | null;
  alt: string;
  uploadState?: UploadState | null;
  className?: string;
  aspectClassName?: string;
  sizes?: string;
};

export const AdminImagePreview = ({
  src,
  alt,
  uploadState,
  className,
  aspectClassName = "h-40 w-full",
  sizes = "(max-width: 768px) 100vw, 448px",
}: AdminImagePreviewProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-muted",
        aspectClassName,
        className
      )}
    >
      {src ? (
        <Image fill src={src} alt={alt} className="object-cover" sizes={sizes} />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
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
