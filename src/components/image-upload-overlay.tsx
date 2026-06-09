export type UploadStage = "deleting" | "compressing" | "uploading" | "saving";

export type UploadState = {
  stage: UploadStage;
  progress: number;
};

export const getStageLabel = (stage: UploadStage): string => {
  switch (stage) {
    case "deleting":
      return "Removing previous file…";
    case "compressing":
      return "Compressing image…";
    case "uploading":
      return "Uploading…";
    case "saving":
      return "Saving…";
  }
};

export const createUploadProgressHandler = (
  setUploadState: (state: UploadState) => void
) => {
  return (progress: number) => {
    if (progress <= 85) {
      setUploadState({ stage: "compressing", progress: Math.max(5, progress) });
      return;
    }

    setUploadState({ stage: "uploading", progress });
  };
};

type ImageUploadOverlayProps = {
  stage: UploadStage;
  progress: number;
  label?: string;
};

export const ImageUploadOverlay = ({
  stage,
  progress,
  label,
}: ImageUploadOverlayProps) => {
  const displayLabel = label ?? getStageLabel(stage);

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 px-4"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-sm font-medium text-white">{displayLabel}</p>
      <div className="w-full max-w-xs">
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={displayLabel}
          className="h-2 w-full overflow-hidden rounded-full bg-white/30"
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-white/80">{progress}%</p>
      </div>
    </div>
  );
};
