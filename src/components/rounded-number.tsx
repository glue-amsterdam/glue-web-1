import { exhibitorTypeStyles } from "@/lib/participants/exhibitor-type-styles";

type Props = {
  type: "special-program" | "up-to-three-participants" | "hub";
  participant_n: string;
  className?: string;
};

const RoundedNumber = ({ type, participant_n, className }: Props) => {
  const { background, text } = exhibitorTypeStyles[type];

  return (
    <div
      className={`flex size-[26px] shrink-0 items-center justify-center rounded-full font-lausanne md:size-[30px] ${background} ${className ?? ""}`}
      aria-hidden
    >
      <span
        className={`m-0 block min-w-[1ch] text-center text-[15px] leading-none tabular-nums ${text}`}
      >
        {participant_n}
      </span>
    </div>
  );
};

export default RoundedNumber;
