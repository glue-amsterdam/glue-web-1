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
  const sizeClass = isPrint
    ? "size-[65px]"
    : size === "sm"
      ? "size-[18px] md:size-[20px]"
      : "size-[26px] md:size-[30px]";
  const textClass = isPrint
    ? "text-[38px] leading-none translate-y-[0.5px]"
    : size === "sm"
      ? "text-[10px] leading-none md:text-[11px] translate-y-[0.5px]"
      : "body-text translate-y-[1.35px]";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-lausanne ${sizeClass} ${className ?? ""}`}
      style={{
        backgroundColor,
        ...(isPrint
          ? {
              width: PRINT_ROUNDED_NUMBER.diameterPx,
              height: PRINT_ROUNDED_NUMBER.diameterPx,
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            }
          : null),
      }}
      aria-hidden
    >
      <span
        className={`m-0 block min-w-[1ch] text-center tabular-nums ${textClass}`}
        style={{
          color,
          ...(isPrint
            ? {
                fontSize: PRINT_ROUNDED_NUMBER.fontSizePx,
                transform: `translateY(${PRINT_ROUNDED_NUMBER.textOffsetYPx}px)`,
              }
            : null),
        }}
      >
        {participant_n}
      </span>
    </div>
  );
};

export default RoundedNumber;
