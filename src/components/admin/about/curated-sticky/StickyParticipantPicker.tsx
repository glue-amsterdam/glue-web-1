"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, Plus, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { splitCommaTokens } from "@/lib/admin/bulk-add-sticky-participants";
import { matchesDisplayNameQuery } from "@/lib/admin/parse-sticky-participants-by-name";
import {
  findParticipantsByName,
  suggestClosestNames,
} from "@/lib/admin/resolve-participant-by-name";
import type { ResolveStickyMembersByNamesResult } from "@/lib/admin/resolve-sticky-member-by-name";
import type { StickyMember } from "@/types/sticky-member";
import {
  getStickyMemberKey,
  normalizeStickyDisplayNameKey,
} from "@/types/sticky-member";

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
  onAddDisplayName: (name: string) => void;
  onAddResolvedUser: (member: {
    user_id: string;
    name: string;
    slug: string;
  }) => void;
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

const buildAmbiguousSummary = (
  ambiguous: ResolveStickyMembersByNamesResult["ambiguous"]
) =>
  ambiguous
    .map((entry) => {
      const candidates =
        entry.candidates
          ?.map((candidate) => {
            const displayName = candidate.display_name?.trim();
            const userName = candidate.user_name?.trim();

            if (displayName && userName && displayName !== userName) {
              return `${displayName} / ${userName}`;
            }

            return candidate.name;
          })
          .join(" | ") ?? "";

      return `${entry.name}: ${candidates}`;
    })
    .join(" · ");

export const StickyParticipantPicker = ({
  allParticipants,
  selectedMembers,
  editingYear,
  onAddParticipant,
  onAddDisplayName,
  onAddResolvedUser,
  onRemoveMember,
}: StickyParticipantPickerProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  const selectedUserIds = useMemo(
    () =>
      selectedMembers
        .filter((member) => member.kind === "user")
        .map((member) => member.user_id),
    [selectedMembers]
  );

  const selectedDisplayNameKeys = useMemo(
    () =>
      selectedMembers
        .filter((member) => member.kind === "display_name")
        .map((member) => member.key),
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
  const displayNameAlreadySelected = selectedDisplayNameKeys.includes(
    normalizeStickyDisplayNameKey(trimmedQuery)
  );

  const handleAddParticipant = useCallback(
    (participant: StickyParticipantOption) => {
      if (selectedUserIds.includes(participant.user_id)) {
        return;
      }

      onAddParticipant(participant);
      setQuery("");
      setIsOpen(false);
    },
    [onAddParticipant, selectedUserIds]
  );

  const handleAddDisplayNameOnly = useCallback(() => {
    if (!trimmedQuery || displayNameAlreadySelected) {
      return;
    }

    onAddDisplayName(trimmedQuery);
    setQuery("");
    setIsOpen(false);
  }, [displayNameAlreadySelected, onAddDisplayName, trimmedQuery]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const getOtherStickyYears = (participant: StickyParticipantOption) => {
    if (editingYear == null) return participant.sticky_years;
    return participant.sticky_years.filter((year) => year !== editingYear);
  };

  const handleBulkApply = async () => {
    const names = splitCommaTokens(bulkText);

    if (names.length === 0) {
      toast({
        title: "Nothing to add",
        description: "Enter names separated by commas, then click Add all.",
      });
      return;
    }

    setIsBulkApplying(true);

    try {
      const res = await fetch("/api/admin/sticky-groups/participants/by-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names,
          selected_user_ids: selectedUserIds,
          selected_display_name_keys: selectedDisplayNameKeys,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed to resolve names (${res.status})`);
      }

      const result = (await res.json()) as ResolveStickyMembersByNamesResult;

      for (const user of result.matchedUsers) {
        onAddResolvedUser({
          user_id: user.user_id,
          name: user.name,
          slug: user.slug ?? "",
        });
      }

      for (const name of result.displayNameOnly) {
        onAddDisplayName(name);
      }

      const summaryParts: string[] = [];

      if (result.matchedUsers.length > 0) {
        summaryParts.push(
          `Added ${result.matchedUsers.length} GLUE member${result.matchedUsers.length === 1 ? "" : "s"}`
        );
      }

      if (result.displayNameOnly.length > 0) {
        summaryParts.push(
          `Added ${result.displayNameOnly.length} display-name-only entr${result.displayNameOnly.length === 1 ? "y" : "ies"}`
        );
      }

      if (result.ambiguous.length > 0) {
        summaryParts.push(`Ambiguous: ${buildAmbiguousSummary(result.ambiguous)}`);
      }

      if (result.alreadySelected.length > 0) {
        summaryParts.push(
          `Already added: ${result.alreadySelected.join(", ")}`
        );
      }

      const addedCount =
        result.matchedUsers.length + result.displayNameOnly.length;
      const hasErrors = result.ambiguous.length > 0;

      toast({
        title: addedCount > 0 ? "Bulk add complete" : "Bulk add issues",
        description: summaryParts.join(" · ") || "No names were added.",
        variant: hasErrors && addedCount === 0 ? "destructive" : "default",
      });

      if (addedCount > 0) {
        setBulkText("");
        setShowBulkAdd(false);
      }
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Bulk add failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBulkApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium block">Add members</label>
        <p className="text-xs text-gray-500 mt-1">
          Search participants above to add one by one. Bulk add below matches
          GLUE members by display name and saves unmatched names as
          display-only. Click Save Group to persist.
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!trimmedQuery || displayNameAlreadySelected}
                onClick={handleAddDisplayNameOnly}
                className="w-full"
              >
                Add as display name only
              </Button>
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

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowBulkAdd((prev) => !prev)}
        >
          {showBulkAdd ? "Hide add multiple" : "Add multiple"}
        </Button>

        {showBulkAdd && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Nombre 1, Nombre 2, Nombre 3"
              rows={4}
              aria-label="Comma-separated member names"
            />
            <p className="text-xs text-gray-500">
              Paste comma-separated names. Each name is matched to GLUE members
              by display name first; anything still unmatched is saved as
              display-only.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleBulkApply}
              disabled={!bulkText.trim() || isBulkApplying}
            >
              {isBulkApplying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving names...
                </>
              ) : (
                "Add all"
              )}
            </Button>
          </div>
        )}
      </div>

      {selectedMembers.length > 0 && (
        <ul className="space-y-1 border border-gray-200 rounded max-h-64 overflow-y-auto">
          {selectedMembers.map((member) => (
            <li
              key={getStickyMemberKey(member)}
              className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="min-w-0">
                <span className="font-medium truncate block">{member.name}</span>
                {member.kind === "display_name" && (
                  <span className="text-xs text-gray-500">Display name only</span>
                )}
              </div>
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
