import { getCategoryInlineStyles } from "@/lib/participants/exhibitor-type-styles";

type Props = {
  type: string;
  participant_n: string;
  className?: string;
};

const RoundedNumber = ({ type, participant_n, className }: Props) => {
  const { backgroundColor, color } = getCategoryInlineStyles(type);

  return (
    <div
      className={`flex size-[26px] shrink-0 items-center justify-center rounded-full font-lausanne md:size-[30px] ${className ?? ""}`}
      style={{ backgroundColor }}
      aria-hidden
    >
      <span
        className="m-0 block min-w-[1ch] translate-y-[1.35px] text-center body-text tabular-nums"
        style={{ color }}
      >
        {participant_n}
      </span>
    </div>
  );
};

export default RoundedNumber;
