"use client";

import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePostThumbnailUpload } from "@/hooks/usePostThumbnailUpload";

type Props = {
  postId: string;
  initialThumbnail: string | null;
  onSaved?: (thumbnailUrl: string | null) => void;
};

const PostThumbnailField = ({ postId, initialThumbnail, onSaved }: Props) => {
  const {
    previewUrl,
    uploadState,
    fileInputRef,
    isBusy,
    isRemoving,
    openFilePicker,
    handleFileSelect,
    handleRemove,
  } = usePostThumbnailUpload({
    postId,
    initialThumbnail,
    onSaved,
  });

  return (
    <div className="grid gap-2">
      <Label htmlFor="post-thumbnail">Thumbnail</Label>
      <p className="text-sm text-muted-foreground">
        Cover image for the home page post card. Recommended portrait ratio.
      </p>
      <input
        ref={fileInputRef}
        id="post-thumbnail"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileSelect}
        disabled={isBusy}
        aria-label="Upload post thumbnail"
      />
      <AdminImagePreview
        src={previewUrl}
        alt="Post thumbnail preview"
        uploadState={uploadState}
        aspectClassName="mx-auto h-[240px] w-full max-w-[280px]"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={openFilePicker}
          disabled={isBusy}
        >
          {previewUrl ? "Replace thumbnail" : "Upload thumbnail"}
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
            disabled={isBusy}
          >
            {isRemoving ? "Removing…" : "Remove"}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default PostThumbnailField;
