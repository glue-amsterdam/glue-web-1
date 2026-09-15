"use client";

import BigButton from "@/components/big-button";
import { cn } from "@/lib/utils";

type SelectedRouteBlockProps = {
  routeName: string;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: () => void;
  onDownload: () => void | Promise<void>;
  nameClassName?: string;
  className?: string;
};

const SelectedRouteBlock = ({
  routeName,
  isSelected,
  onSelect,
  onNavigate,
  onDownload,
  nameClassName,
  className,
}: SelectedRouteBlockProps) => {
  const handleDownload = () => {
    void onDownload();
  };

  return (
    <div className={cn("flex flex-col gap-[15px]", className)}>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className="w-full cursor-pointer text-left"
      >
        <p
          className={cn(
            "versal-body-text min-w-0",
            isSelected && "text-(--primary-color)",
            nameClassName
          )}
        >
          {routeName}
        </p>
      </button>

      {isSelected && (
        <>
          <div className="flex gap-[15px]">
            <BigButton
              as="button"
              mode="map"
              fontSize="map"
              label="navigate"
              onClick={onNavigate}
            />
            <BigButton
              as="button"
              mode="map"
              fontSize="map"
              label="download"
              onClick={handleDownload}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SelectedRouteBlock;
