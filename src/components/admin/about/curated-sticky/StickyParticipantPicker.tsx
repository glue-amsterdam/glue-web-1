"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { matchesDisplayNameQuery } from "@/lib/admin/parse-sticky-participants-by-name";
import {
  findParticipantsByName,
  suggestClosestNames,
} from "@/lib/admin/resolve-participant-by-name";
import type { StickyMember } from "@/types/sticky-member";
import { getStickyMemberKey } from "@/types/sticky-member";

export type StickyParticipantOption = {
  user_id: string;
  name: string;
  slug: string;
  display_name?: string | null;
  user_name?: string | null;
  display_number?: string | null;
  status: string;
  sticky_years: number[];
};

type StickyParticipantPickerProps = {
  allParticipants: StickyParticipantOption[];
  selectedMembers: StickyMember[];
  editingYear: number | null;
  onAddParticipant: (participant: StickyParticipantOption) => void;
  onRemoveMember: (memberKey: string) => void;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const getParticipantListLabel = (participant: StickyParticipantOption) => {
  const displayName = participant.display_name?.trim();
  const userName = participant.user_name?.trim();

  if (displayName && userName && displayName !== userName) {
    return `${displayName} (${userName})`;
  }

  return participant.name;
};

export const StickyParticipantPicker = ({
  allParticipants,
  selectedMembers,
  editingYear,
  onAddParticipant,
  onRemoveMember,
}: StickyParticipantPickerProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedUserIds = useMemo(
    () => selectedMembers.map((member) => member.user_id),
    [selectedMembers]
  );

  const catalogForResolve = useMemo(
    () =>
      allParticipants.map((participant) => ({
        user_id: participant.user_id,
        slug: participant.slug,
        display_name: participant.display_name ?? null,
        display_number: participant.display_number ?? null,
        user_name: participant.user_name ?? null,
        name: participant.name,
        status: participant.status,
      })),
    [allParticipants]
  );

  const resolvedSuggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    return findParticipantsByName(trimmed, catalogForResolve)
      .slice(0, 3)
      .map((participant) => {
        const existing = allParticipants.find(
          (entry) => entry.user_id === participant.user_id
        );

        return (
          existing ?? {
            user_id: participant.user_id,
            name: participant.name,
            slug: participant.slug,
            display_name: participant.display_name,
            user_name: participant.user_name,
            display_number: participant.display_number,
            status: participant.status,
            sticky_years: [],
          }
        );
      });
  }, [allParticipants, catalogForResolve, query]);

  const partialSuggestions = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery.length < 2) return [];

    return allParticipants
      .filter((participant) => matchesDisplayNameQuery(participant, query))
      .slice(0, 12);
  }, [allParticipants, query]);

  const suggestions = useMemo(() => {
    const merged = new Map<string, StickyParticipantOption>();

    for (const participant of resolvedSuggestions) {
      merged.set(participant.user_id, participant);
    }

    for (const participant of partialSuggestions) {
      if (!merged.has(participant.user_id)) {
        merged.set(participant.user_id, participant);
      }
    }

    return [...merged.values()].slice(0, 12);
  }, [partialSuggestions, resolvedSuggestions]);

  const closestNameHints = useMemo(() => {
    if (!query.trim() || suggestions.length > 0) return [];
    return suggestClosestNames(query.trim(), catalogForResolve);
  }, [catalogForResolve, query, suggestions.length]);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const showPopover = isOpen && hasQuery;

  const handleAddParticipant = (participant: StickyParticipantOption) => {
    if (selectedUserIds.includes(participant.user_id)) {
      return;
    }

    onAddParticipant(participant);
    setQuery("");
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const getOtherStickyYears = (participant: StickyParticipantOption) => {
    if (editingYear == null) return participant.sticky_years;
    return participant.sticky_years.filter((year) => year !== editingYear);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium block">Participants with profile</label>
        <p className="text-xs text-gray-500 mt-1">
          Search and add participants who have an active GLUE profile. They will
          link to their exhibitor page on the public site.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {allParticipants.length} participant
          {allParticipants.length === 1 ? "" : "s"} loaded for search
        </p>
      </div>

      <Popover open={showPopover} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (hasQuery) {
                setIsOpen(true);
              }
            }}
            placeholder="Search participants by name..."
            aria-label="Search participants by name"
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {suggestions.length === 0 ? (
            <div className="px-2 py-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                No participant matches
              </p>
              {closestNameHints.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Did you mean: {closestNameHints.join(", ")}
                </p>
              )}
            </div>
          ) : (
            <ul className="space-y-1 max-h-64 overflow-y-auto">
              {suggestions.map((participant) => {
                const isSelected = selectedUserIds.includes(participant.user_id);
                const otherYears = getOtherStickyYears(participant);

                return (
                  <li
                    key={participant.user_id}
                    className="flex items-center justify-between gap-2 rounded px-2 py-2 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {getParticipantListLabel(participant)}
                      </p>
                      {otherYears.length > 0 && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Sticky in: {otherYears.join(", ")}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isSelected}
                      onClick={() => handleAddParticipant(participant)}
                      aria-label={`Add ${getParticipantListLabel(participant)}`}
                      className="shrink-0 h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </PopoverContent>
      </Popover>

      {selectedMembers.length > 0 && (
        <ul className="space-y-1 border border-gray-200 rounded max-h-64 overflow-y-auto">
          {selectedMembers.map((member) => (
            <li
              key={getStickyMemberKey(member)}
              className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 last:border-b-0"
            >
              <span className="font-medium truncate block">{member.name}</span>
              <button
                type="button"
                onClick={() => onRemoveMember(getStickyMemberKey(member))}
                className="p-1 hover:bg-gray-100 rounded shrink-0"
                aria-label={`Remove ${member.name}`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
