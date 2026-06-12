"use client";

import { useState, useMemo, useEffect } from "react";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin-user";
import {
  UserRowDesktop,
  UserRowMobile,
} from "@/app/dashboard/[userId]/users-admin/user-row";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Category = "all" | "participant" | "visitor" | "moderator";
type SortBy = "name" | "status" | "createdAt";
type CreatedAtFilter = "all" | "7d" | "30d" | "90d";

const CREATED_AT_FILTER_DAYS: Record<Exclude<CreatedAtFilter, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getCreatedAtCutoff = (filter: CreatedAtFilter): number | null => {
  if (filter === "all") return null;
  return Date.now() - CREATED_AT_FILTER_DAYS[filter] * MS_PER_DAY;
};

const getCreatedAtTimestamp = (createdAt: string | null): number | null => {
  if (!createdAt) return null;
  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "participant", label: "Participants" },
  { value: "visitor", label: "Visitors" },
  { value: "moderator", label: "Moderators" },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  accepted: 1,
  declined: 2,
};

const selectClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black";

const inputClass =
  "w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black md:max-w-sm";

const filterButtonClass = (active: boolean) =>
  `text-xs border rounded px-2 py-1 ${active ? "bg-black text-white border-black" : "border-gray-300"
  }`;

interface UsersAdminPanelProps {
  users: AdminUserListItem[];
}

export default function UsersAdminPanel({ users: initialUsers }: UsersAdminPanelProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<
    Map<string, AdminUserDetail>
  >(new Map());
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [detailErrors, setDetailErrors] = useState<Map<string, string>>(
    new Map()
  );

  const [participantStatus, setParticipantStatus] = useState("all");
  const [stickyFilter, setStickyFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [specialProgramFilter, setSpecialProgramFilter] = useState("all");
  const [reactivationStatusFilter, setReactivationStatusFilter] =
    useState("all");
  const [createdAtFilter, setCreatedAtFilter] = useState<CreatedAtFilter>("all");

  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleModStatusChange = (userId: string, isMod: boolean) => {
    setUsers((current) =>
      current.map((user) =>
        user.userId === userId ? { ...user, isMod } : user
      )
    );
    setDetailCache((current) => {
      const detail = current.get(userId);
      if (!detail) return current;

      const next = new Map(current);
      next.set(userId, { ...detail, isMod });
      return next;
    });
    router.refresh();
  };

  const hasParticipantFilterActive =
    participantStatus !== "all" ||
    stickyFilter !== "all" ||
    activeFilter !== "all" ||
    specialProgramFilter !== "all" ||
    reactivationStatusFilter !== "all";

  const hasAnyFilterActive =
    hasParticipantFilterActive ||
    createdAtFilter !== "all" ||
    searchTerm !== "";

  useEffect(() => {
    if (
      expandedUserId &&
      !users.some((user) => user.userId === expandedUserId)
    ) {
      setExpandedUserId(null);
    }
  }, [users, expandedUserId]);

  const filteredAndSortedUsers = useMemo(() => {
    const createdAtCutoff = getCreatedAtCutoff(createdAtFilter);

    const filtered = users.filter((user) => {
      if (category === "participant" && user.entityType !== "participant") {
        return false;
      }
      if (category === "visitor" && user.entityType !== "visitor") {
        return false;
      }
      if (category === "moderator" && !user.isMod) {
        return false;
      }

      if (hasParticipantFilterActive && user.entityType !== "participant") {
        return false;
      }

      if (createdAtCutoff !== null) {
        const createdAtTimestamp = getCreatedAtTimestamp(user.createdAt);
        if (createdAtTimestamp === null || createdAtTimestamp < createdAtCutoff) {
          return false;
        }
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = user.displayName
          .toLowerCase()
          .includes(searchLower);
        const matchesEmail = user.email?.toLowerCase().includes(searchLower);
        const matchesId = user.userId.toLowerCase().includes(searchLower);
        const matchesSlug = user.participantSlug
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesName && !matchesEmail && !matchesId && !matchesSlug) {
          return false;
        }
      }

      if (user.entityType === "participant") {
        if (
          participantStatus !== "all" &&
          user.participantStatus !== participantStatus
        ) {
          return false;
        }
        if (stickyFilter === "sticky" && !user.participantIsSticky) {
          return false;
        }
        if (stickyFilter === "not_sticky" && user.participantIsSticky) {
          return false;
        }
        if (activeFilter === "active" && !user.participantIsActive) {
          return false;
        }
        if (activeFilter === "inactive" && user.participantIsActive) {
          return false;
        }
        if (specialProgramFilter === "yes" && !user.participantSpecialProgram) {
          return false;
        }
        if (specialProgramFilter === "no" && user.participantSpecialProgram) {
          return false;
        }
        if (
          reactivationStatusFilter !== "all" &&
          user.participantReactivationStatus !== reactivationStatusFilter
        ) {
          return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => {
      let cmp = 0;

      if (sortBy === "status" && category === "participant") {
        const aOrder = STATUS_ORDER[a.participantStatus ?? ""] ?? 99;
        const bOrder = STATUS_ORDER[b.participantStatus ?? ""] ?? 99;
        cmp = aOrder - bOrder;
        if (cmp === 0) {
          cmp = a.displayName.localeCompare(b.displayName, undefined, {
            sensitivity: "base",
          });
        }
      } else if (sortBy === "createdAt") {
        const aTimestamp = getCreatedAtTimestamp(a.createdAt);
        const bTimestamp = getCreatedAtTimestamp(b.createdAt);

        if (aTimestamp === null && bTimestamp === null) {
          cmp = 0;
        } else if (aTimestamp === null) {
          cmp = 1;
        } else if (bTimestamp === null) {
          cmp = -1;
        } else {
          cmp = aTimestamp - bTimestamp;
        }

        if (cmp === 0) {
          cmp = a.displayName.localeCompare(b.displayName, undefined, {
            sensitivity: "base",
          });
        }
      } else {
        cmp = a.displayName.localeCompare(b.displayName, undefined, {
          sensitivity: "base",
        });
      }

      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [
    users,
    searchTerm,
    category,
    participantStatus,
    stickyFilter,
    activeFilter,
    specialProgramFilter,
    reactivationStatusFilter,
    createdAtFilter,
    sortBy,
    sortOrder,
    hasParticipantFilterActive,
  ]);

  const handleToggleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);

    if (detailCache.has(userId)) {
      return;
    }

    setLoadingDetailId(userId);
    setDetailErrors((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to load user details");
      }
      const data = (await response.json()) as AdminUserDetail;
      setDetailCache((prev) => new Map(prev).set(userId, data));
    } catch {
      setDetailErrors((prev) =>
        new Map(prev).set(userId, "Failed to load user details")
      );
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleToggleSelect = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${selectedUsers.size} user(s)? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const userIdsToDelete = Array.from(selectedUsers);

    try {
      const response = await fetch("/api/deleteUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: userIdsToDelete }),
      });

      const result = await response.json();

      if (response.ok) {
        setSelectedUsers(new Set());
        setExpandedUserId(null);
        router.refresh();

        if (response.status === 207) {
          toast({
            title: "Partial deletion",
            description: `${result.deletedUsers.length} deleted, ${result.failedDeletions.length} failed.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Deleted",
            description: `${result.deletedUsers.length} user(s) deleted.`,
          });
        }
      } else {
        throw new Error(result.message || "Failed to delete users");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setParticipantStatus("all");
    setStickyFilter("all");
    setActiveFilter("all");
    setSpecialProgramFilter("all");
    setReactivationStatusFilter("all");
    setCreatedAtFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  const handleSortByChange = (value: SortBy) => {
    setSortBy(value);
    if (value === "createdAt") {
      setSortOrder("desc");
    }
  };

  const showParticipantFilters = category === "participant";

  return (
    <div className="px-4 md:px-[30px] mini-padding pb-8 min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Users Admin</h1>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={selectedUsers.size === 0 || isDeleting}
          className="text-xs border border-red-300 rounded px-2 py-1 text-red-700 disabled:opacity-50"
          aria-label="Delete selected users"
        >
          {isDeleting ? "Deleting…" : "Delete selected"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{filteredAndSortedUsers.length} users</span>
        {selectedUsers.size > 0 && (
          <span>{selectedUsers.size} selected</span>
        )}
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search name, email, ID, slug…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
          aria-label="Search users"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2 items-center">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setCategory(value);
              if (value !== "participant") {
                setParticipantStatus("all");
                setStickyFilter("all");
                setActiveFilter("all");
                setSpecialProgramFilter("all");
                setReactivationStatusFilter("all");
                if (sortBy === "status") {
                  setSortBy("name");
                }
              }
            }}
            className={filterButtonClass(category === value)}
            aria-pressed={category === value}
          >
            {label}
          </button>
        ))}
        <select
          value={createdAtFilter}
          onChange={(e) => setCreatedAtFilter(e.target.value as CreatedAtFilter)}
          className={selectClass}
          aria-label="Filter by registration date"
        >
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => handleSortByChange(e.target.value as SortBy)}
          className={selectClass}
          aria-label="Sort by"
        >
          <option value="name">Sort by name</option>
          {category === "participant" && (
            <option value="status">Sort by status</option>
          )}
          <option value="createdAt">Sort by created date</option>
        </select>
        <button
          type="button"
          onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
          className="text-xs border border-gray-300 rounded px-2 py-1"
          aria-label="Toggle sort order"
        >
          {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
        </button>
        {hasAnyFilterActive && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {showParticipantFilters && (
        <div className="mb-3 flex flex-wrap gap-2 items-end">
          <label className="flex flex-col gap-0.5 text-xs text-gray-600">
            Status
            <select
              value={participantStatus}
              onChange={(e) => setParticipantStatus(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs text-gray-600">
            Active
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs text-gray-600">
            Sticky
            <select
              value={stickyFilter}
              onChange={(e) => setStickyFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="sticky">Sticky</option>
              <option value="not_sticky">Not sticky</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs text-gray-600">
            Special
            <select
              value={specialProgramFilter}
              onChange={(e) => setSpecialProgramFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5 text-xs text-gray-600">
            Reactivation
            <select
              value={reactivationStatusFilter}
              onChange={(e) => setReactivationStatusFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </label>
        </div>
      )}

      {filteredAndSortedUsers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found</p>
      ) : (
        <>
          <div className="md:hidden border border-gray-200 min-w-0">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-2 py-2 text-sm font-medium">
              <span className="w-4 shrink-0">
                <span className="sr-only">Select</span>
              </span>
              <span className="min-w-0 flex-1">Name</span>
              <span className="shrink-0">Actions</span>
            </div>
            {filteredAndSortedUsers.map((user) => (
              <UserRowMobile
                key={user.userId}
                user={user}
                isExpanded={expandedUserId === user.userId}
                isSelected={selectedUsers.has(user.userId)}
                detail={detailCache.get(user.userId)}
                isLoadingDetail={loadingDetailId === user.userId}
                detailError={detailErrors.get(user.userId)}
                onToggleExpand={handleToggleExpand}
                onToggleSelect={handleToggleSelect}
                onModStatusChange={handleModStatusChange}
              />
            ))}
          </div>

          <div className="hidden md:block border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-3 py-2 font-medium w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium min-w-32 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((user) => (
                  <UserRowDesktop
                    key={user.userId}
                    user={user}
                    isExpanded={expandedUserId === user.userId}
                    isSelected={selectedUsers.has(user.userId)}
                    detail={detailCache.get(user.userId)}
                    isLoadingDetail={loadingDetailId === user.userId}
                    detailError={detailErrors.get(user.userId)}
                    onToggleExpand={handleToggleExpand}
                    onToggleSelect={handleToggleSelect}
                    onModStatusChange={handleModStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
