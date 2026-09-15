import { getCategoryInlineStyles } from "@/lib/participants/exhibitor-type-styles";
import { PRINT_ROUNDED_NUMBER } from "@/lib/map/map-point-marker-spec";

type Props = {
  type: string;
  participant_n: string;
  className?: string;
  size?: "default" | "sm" | "print";
  /** Resolved fill; when set, overrides category CSS vars (print / map parity). */
  backgroundColor?: string;
  /** Resolved text color; when set, overrides category CSS vars. */
  color?: string;
};

const RoundedNumber = ({
  type,
  participant_n,
  className,
  size = "default",
  backgroundColor: backgroundColorProp,
  color: colorProp,
}: Props) => {
  const categoryStyles = getCategoryInlineStyles(type);
  const backgroundColor = backgroundColorProp ?? categoryStyles.backgroundColor;
  const color = colorProp ?? categoryStyles.color;
  const isPrint = size === "print";

  if (isPrint) {
    const { diameterPx, fontSizePx, textOffsetYPx } = PRINT_ROUNDED_NUMBER;
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full font-lausanne ${className ?? ""}`}
        style={{
          width: `${diameterPx}px`,
          height: `${diameterPx}px`,
          backgroundColor,
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
        aria-hidden
      >
        <span
          className="m-0 block min-w-[1ch] text-center tabular-nums leading-none"
          style={{
            color,
            fontSize: `${fontSizePx}px`,
            transform: `translateY(${textOffsetYPx}px)`,
          }}
        >
          {participant_n}
        </span>
      </div>
    );
  }

  const sizeClass =
    size === "sm"
      ? "size-[18px] md:size-[20px]"
      : "size-[26px] md:size-[30px]";
  const textClass =
    size === "sm"
      ? "text-[10px] leading-none md:text-[11px] translate-y-[0.5px]"
      : "body-text translate-y-[1.35px]";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-lausanne ${sizeClass} ${className ?? ""}`}
      style={{ backgroundColor }}
      aria-hidden
    >
      <span
        className={`m-0 block min-w-[1ch] text-center tabular-nums ${textClass}`}
        style={{ color }}
      >
        {participant_n}
      </span>
    </div>
  );
};

export default RoundedNumber;
