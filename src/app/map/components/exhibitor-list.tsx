"use client";

import RoundedNumber from "@/components/rounded-number";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isMapHubEntity } from "@/lib/map/map-location-display";
import { getHubMemberSelectionKey } from "@/lib/map/exhibitor-footer-slides";
import type { MapLocation } from "@/lib/map/types";
import type { MapLocationSelectOptions } from "@/app/map/stores/use-map-store";
import type { ExhibitorsFilterType } from "@/lib/participants/exhibitors-filters";
import { cn } from "@/lib/utils";

type ExhibitorListProps = {
  locations: MapLocation[];
  selectedLocation: string | null;
  onLocationSelect: (
    locationId: string,
    options?: MapLocationSelectOptions
  ) => void;
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

  const memberButtonClassName = cn(
    "w-full text-left flex items-start gap-[15px] cursor-pointer pl-[39px]",
    variant === "panel" && "py-[2px]"
  );

  const renderFlatRow = (location: MapLocation) => {
    const selectionId = location.mapSelectionId ?? location.id;
    const isSelected = selectedLocation === selectionId;
    const displayNumber = location.displayNumber ?? " ";
    const memberKey = location.hubMemberUserId;

    return (
      <li key={location.id}>
        <button
          type="button"
          onClick={() =>
            onLocationSelect(selectionId, {
              ...(memberKey ? { memberUserId: memberKey } : {}),
            })
          }
          aria-pressed={isSelected}
          className={listButtonClassName}
        >
          <RoundedNumber type={location.type} participant_n={displayNumber} />
          <p className="truncate lg:max-w-[237px]">{location.name}</p>
        </button>
      </li>
    );
  };

  const listContent = (
    <ul className="py-[30px] lg:flex lg:flex-col lg:gap-[30px] base-text-size">
      {locations.map((location) => {
        if (categoryType === "all" || !isMapHubEntity(location)) {
          return renderFlatRow(location);
        }

        const isSelected = selectedLocation === location.id;
        const displayNumber = location.displayNumber ?? " ";
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
              <p className="truncate lg:max-w-[237px]">{location.name}</p>
            </button>
            {hubMembers.length > 0 && (
              <ul
                className="text-(--black-color) list-none flex flex-col gap-[8px]"
                aria-label="Hub members"
              >
                {hubMembers.map((member) => {
                  const memberKey = getHubMemberSelectionKey(member);
                  const isMemberSelected = selectedLocation === location.id;
                  const memberDisplayNumber = member.displayNumber ?? " ";
                  const memberType = member.type ?? location.type;

                  return (
                    <li key={member.userId ?? member.slug ?? member.name}>
                      <button
                        type="button"
                        onClick={() =>
                          onLocationSelect(location.id, {
                            ...(memberKey ? { memberUserId: memberKey } : {}),
                          })
                        }
                        aria-pressed={isMemberSelected}
                        aria-label={`Select ${member.name}`}
                        className={memberButtonClassName}
                      >
                        <RoundedNumber
                          type={memberType}
                          participant_n={memberDisplayNumber}
                        />
                        <span className="truncate lg:max-w-[237px]">
                          {member.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
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
