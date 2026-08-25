import RoundedNumber from "@/components/rounded-number";
import type { DisplayNumberBadge } from "@/lib/numbers/resolve-display-number-badges";

type DisplayNumberClusterProps = {
  badges: DisplayNumberBadge[];
  fallbackType: string;
  className?: string;
  size?: "default" | "sm";
};

const DisplayNumberCluster = ({
  badges,
  fallbackType,
  className,
  size = "default",
}: DisplayNumberClusterProps) => {
  const visibleBadges =
    badges.length > 0
      ? badges
      : [{ value: " ", type: fallbackType, source: "own" as const }];

  return (
    <div className={`flex shrink-0 items-center gap-[4px] ${className ?? ""}`}>
      {visibleBadges.map((badge) => (
        <RoundedNumber
          key={`${badge.source}:${badge.value}`}
          type={badge.type}
          participant_n={badge.value}
          size={size}
        />
      ))}
    </div>
  );
};

export default DisplayNumberCluster;
