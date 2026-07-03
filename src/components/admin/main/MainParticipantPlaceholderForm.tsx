"use client";

import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParticipantPlaceholderUpload } from "@/hooks/useParticipantPlaceholderUpload";

type Props = {
  initialPlaceholderUrl: string;
};

const MainParticipantPlaceholderForm = ({ initialPlaceholderUrl }: Props) => {
  const {
    previewUrl,
    uploadState,
    fileInputRef,
    isBusy,
    openFilePicker,
    handleFileSelect,
  } = useParticipantPlaceholderUpload({ initialPlaceholderUrl });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="title-text mb-2">Participant placeholder</h2>
        <p className="text-sm text-muted-foreground">
          Default image shown when a participant has no profile photo. Used
          across exhibitors, map, and home. Landscape ratio ~450×242; compressed
          automatically to ~250 KB.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="participant-placeholder">Placeholder image</Label>
        <input
          ref={fileInputRef}
          id="participant-placeholder"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileSelect}
          disabled={isBusy}
          aria-label="Upload participant placeholder image"
        />
        <AdminImagePreview
          src={previewUrl}
          alt="Participant placeholder preview"
          uploadState={uploadState}
          aspectClassName="mx-auto h-[180px] w-full max-w-[334px]"
        />
        <Button
          type="button"
          variant="outline"
          onClick={openFilePicker}
          disabled={isBusy}
        >
          Replace placeholder
        </Button>
      </div>
    </section>
  );
};

export default MainParticipantPlaceholderForm;
