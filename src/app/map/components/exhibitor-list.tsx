"use client";

import { useMemo } from "react";
import RoundedNumber from "@/components/rounded-number";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MapLocation } from "@/lib/map/types";
import { cn } from "@/lib/utils";

type ExhibitorListProps = {
  locations: MapLocation[];
  selectedLocation: string | null;
  onLocationSelect: (locationId: string) => void;
  variant?: "sidebar" | "panel";
  className?: string;
  /** When false, hub rows show only the hub name (no member list). */
  showHubMembers?: boolean;
};

const ExhibitorList = ({
  locations,
  selectedLocation,
  onLocationSelect,
  variant = "sidebar",
  className,
  showHubMembers = false,
}: ExhibitorListProps) => {
  const sortedLocations = useMemo(
    () =>
      [...locations].sort((a, b) => {
        const numA = a.displayNumber ?? "";
        const numB = b.displayNumber ?? "";
        return numA.localeCompare(numB, undefined, { numeric: true });
      }),
    [locations]
  );

  const listContent = (
    <ul className="py-[30px] lg:flex lg:flex-col lg:gap-[30px]">
      {sortedLocations.map((location) => {
        const isSelected = selectedLocation === location.id;
        const displayNumber = location.displayNumber ?? " ";

        if (location.type === "hub") {
          const hubMembers = showHubMembers ? (location.members ?? []) : [];

          return (
            <li key={location.id} className="flex flex-col gap-[8px]">
              <button
                type="button"
                onClick={() => onLocationSelect(location.id)}
                aria-pressed={isSelected}
                className="lg:px-0 w-full text-left flex items-start gap-[15px] cursor-pointer base-text-size"
              >
                <RoundedNumber
                  type={location.type}
                  participant_n={displayNumber}
                />
                <div>
                  <p className="truncate lg:max-w-[237px]">{location.name}</p>
                  {showHubMembers && hubMembers.length > 0 && (
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
              className={cn(
                "lg:px-0 w-full text-left flex items-start gap-[15px] cursor-pointer",
                variant === "panel" && "py-[10px]"
              )}
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
      {sortedLocations.length === 0 && (
        <li className="base-text-size text-(--gray-color) py-[10px]">
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
