import GlueLogo from "@/app/components/glue-logo";

export function LoadingFallback({ size = 56 }: { size?: number }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className={`size-${size} animate-pulse animate relative`}>
        <GlueLogo fill className="filter" />
      </div>
    </div>
  );
}

export function LoadingFallbackMini({ size = 56 }: { size?: number }) {
  return (
    <div className="w-full h-full flew-grow flex items-center justify-center bg-black/0">
      <div className={`size-${size} animate-pulse animate relative`}>
        <GlueLogo fill className="filter" />
      </div>
    </div>
  );
}
