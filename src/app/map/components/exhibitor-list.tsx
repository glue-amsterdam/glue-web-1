"use client";

import RoundedNumber from "@/components/rounded-number";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isMapHubEntity } from "@/lib/map/map-location-display";
import type { MapLocation } from "@/lib/map/types";
import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import { cn } from "@/lib/utils";

type ExhibitorListProps = {
  locations: MapLocation[];
  selectedLocation: string | null;
  onLocationSelect: (locationId: string) => void;
  categoryType: ExhibitorsFilterType;
  variant?: "sidebar" | "panel";
  className?: string;
};

const shouldShowHubMembers = (
  location: MapLocation,
  categoryType: ExhibitorsFilterType
): boolean =>
  categoryType !== "all" &&
  categoryType === location.type &&
  isMapHubEntity(location);

const ExhibitorList = ({
  locations,
  selectedLocation,
  onLocationSelect,
  categoryType,
  variant = "sidebar",
  className,
}: ExhibitorListProps) => {
  const listButtonClassName = cn(
    "lg:px-0 w-full text-left flex items-start gap-[15px] cursor-pointer",
    variant === "panel" && "py-[10px]"
  );

  const listContent = (
    <ul className="py-[30px] lg:flex lg:flex-col lg:gap-[30px] base-text-size">
      {locations.map((location) => {
        const isSelected = selectedLocation === location.id;
        const displayNumber = location.displayNumber ?? " ";

        if (isMapHubEntity(location)) {
          const hubMembers = shouldShowHubMembers(location, categoryType)
            ? (location.members ?? [])
            : [];

          return (
            <li key={location.id} className="flex flex-col gap-[8px]">
              <button
                type="button"
                onClick={() => onLocationSelect(location.id)}
                aria-pressed={isSelected}
                className={listButtonClassName}
              >
                <RoundedNumber
                  type={location.type}
                  participant_n={displayNumber}
                />
                <div>
                  <p className="truncate lg:max-w-[237px]">{location.name}</p>
                  {hubMembers.length > 0 && (
                    <ul
                      className="text-(--black-color) list-none"
                      aria-label="Hub members"
                    >
                      {hubMembers.map((member) => (
                        <li key={member.slug ?? member.name}>
                          <span className="block lg:max-w-[237px]">
                            {member.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </button>
            </li>
          );
        }

        return (
          <li key={location.id}>
            <button
              type="button"
              onClick={() => onLocationSelect(location.id)}
              aria-pressed={isSelected}
              className={listButtonClassName}
            >
              <RoundedNumber
                type={location.type}
                participant_n={displayNumber}
              />
              <p className="truncate lg:max-w-[237px]">{location.name}</p>
            </button>
          </li>
        );
      })}
      {locations.length === 0 && (
        <li className="text-(--gray-color) py-[10px]">
          No exhibitors found.
        </li>
      )}
    </ul>
  );

  if (variant === "panel") {
    return (
      <div className={cn("w-full shrink-0", className)}>{listContent}</div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1 min-h-0", className)}>
      {listContent}
    </ScrollArea>
  );
};

export default ExhibitorList;
