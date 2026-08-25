"use client";

import type { InheritedHubOption } from "@/lib/numbers/pick-inherited-hub";

type HubNumberInheritControlsProps = {
  hubs: InheritedHubOption[];
  showHubNumber: boolean;
  onShowHubNumberChange: (value: boolean) => void;
  disabled?: boolean;
};

const HubNumberInheritControls = ({
  hubs,
  showHubNumber,
  onShowHubNumberChange,
  disabled = false,
}: HubNumberInheritControlsProps) => {
  if (hubs.length === 0) {
    return null;
  }

  return (
    <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-600">
      <input
        type="checkbox"
        checked={showHubNumber}
        disabled={disabled}
        onChange={(event) => onShowHubNumberChange(event.target.checked)}
        aria-label="Show HUB number"
      />
      Show HUB number
    </label>
  );
};

export default HubNumberInheritControls;
