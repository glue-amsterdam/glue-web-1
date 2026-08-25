import { getCategoryInlineStyles } from "@/lib/participants/exhibitor-type-styles";

type Props = {
  type: string;
  participant_n: string;
  className?: string;
  size?: "default" | "sm";
};

const RoundedNumber = ({
  type,
  participant_n,
  className,
  size = "default",
}: Props) => {
  const { backgroundColor, color } = getCategoryInlineStyles(type);
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
