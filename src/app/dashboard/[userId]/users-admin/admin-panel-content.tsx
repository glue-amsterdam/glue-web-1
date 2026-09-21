"use client";

import { useState, useEffect, useRef } from "react";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin-user";
import {
  UserRowDesktop,
  UserRowMobile,
} from "@/app/dashboard/[userId]/users-admin/user-row";
import { useToast } from "@/hooks/use-toast";
import {
  ADMIN_USERS_PAGE_SIZE,
  buildAdminUsersPageSearchParams,
  type AdminUsersCategory,
  type AdminUsersCreatedAtFilter,
  type AdminUsersPageResponse,
  type AdminUsersSortBy,
} from "@/lib/admin/get-admin-users-page";
import { UsersReportDialog } from "@/app/dashboard/[userId]/users-admin/users-report-dialog";
import type { AdminUserReportCategory } from "@/lib/admin/filter-admin-users";

type Category = AdminUsersCategory;
type SortBy = AdminUsersSortBy;
type CreatedAtFilter = AdminUsersCreatedAtFilter;

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "participant", label: "Participants" },
  { value: "visitor", label: "Visitors" },
  { value: "moderator", label: "Moderators" },
];

const selectClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black";

const inputClass =
  "w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black md:max-w-sm";

const filterButtonClass = (active: boolean) =>
  `text-xs border rounded px-2 py-1 ${
    active ? "bg-black text-white border-black" : "border-gray-300"
  }`;

const paginationButtonClass = (active: boolean, disabled: boolean) =>
  `min-w-8 text-xs border rounded px-2 py-1 ${
    active
      ? "bg-black text-white border-black"
      : "border-gray-300 text-black"
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

const SEARCH_DEBOUNCE_MS = 300;

const getVisiblePageNumbers = (
  currentPage: number,
  totalPages: number
): number[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  for (const offset of [-2, -1, 1, 2]) {
    const page = currentPage + offset;
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  return [...pages].sort((a, b) => a - b);
};

interface UsersAdminPanelProps {
  initialData: AdminUsersPageResponse;
}

export default function UsersAdminPanel({
  initialData,
}: UsersAdminPanelProps) {
  const [users, setUsers] = useState<AdminUserListItem[]>(initialData.items);
  const [page, setPage] = useState(initialData.page);
  const [total, setTotal] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  const [createdAtFilter, setCreatedAtFilter] =
    useState<CreatedAtFilter>("all");

  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { toast } = useToast();
  const skipFirstFetchRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

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

  const fetchUsersPage = async (nextPage: number) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = buildAdminUsersPageSearchParams({
        page: nextPage,
        limit: ADMIN_USERS_PAGE_SIZE,
        search: debouncedSearch,
        category,
        createdAtFilter,
        participantStatus,
        stickyFilter,
        activeFilter,
        specialProgramFilter,
        reactivationStatusFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = (await response.json()) as AdminUsersPageResponse;
      if (requestId !== requestIdRef.current) return;

      setUsers(data.items);
      setPage(data.page);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelectedUsers(new Set());
      setExpandedUserId(null);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setLoadError("Failed to load users");
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (skipFirstFetchRef.current) {
      skipFirstFetchRef.current = false;
      return;
    }
    void fetchUsersPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when filters/search/sort change
  }, [
    debouncedSearch,
    category,
    createdAtFilter,
    participantStatus,
    stickyFilter,
    activeFilter,
    specialProgramFilter,
    reactivationStatusFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (
      expandedUserId &&
      !users.some((user) => user.userId === expandedUserId)
    ) {
      setExpandedUserId(null);
    }
  }, [users, expandedUserId]);

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
  };

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

        const remainingOnPage = users.length - (result.deletedUsers?.length ?? 0);
        const nextPage =
          remainingOnPage <= 0 && page > 1 ? page - 1 : page;
        await fetchUsersPage(nextPage);

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
    setDebouncedSearch("");
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

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page || isLoading) {
      return;
    }
    void fetchUsersPage(nextPage);
  };

  const showParticipantFilters = category === "participant";
  const visiblePages = getVisiblePageNumbers(page, Math.max(totalPages, 0));

  return (
    <div className="px-4 md:px-[30px] mini-padding pb-8 min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="title-text">Users Admin</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReportDialogOpen(true)}
            className="text-xs border border-gray-300 rounded px-2 py-1 text-black"
            aria-label="Print report"
          >
            Print Report
          </button>
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
      </div>

      <UsersReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        initialCategory={category as AdminUserReportCategory}
        initialParticipantStatus={
          participantStatus === "pending" ||
          participantStatus === "accepted" ||
          participantStatus === "declined"
            ? participantStatus
            : "all"
        }
      />

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          {total} user{total === 1 ? "" : "s"}
          {totalPages > 0 ? ` · page ${page} of ${totalPages}` : ""}
        </span>
        {selectedUsers.size > 0 && (
          <span>{selectedUsers.size} selected</span>
        )}
        {isLoading && <span aria-live="polite">Loading…</span>}
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
          onChange={(e) =>
            setCreatedAtFilter(e.target.value as CreatedAtFilter)
          }
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

      {loadError && users.length === 0 ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found</p>
      ) : (
        <>
          <div
            className={`md:hidden border border-gray-200 min-w-0 ${
              isLoading ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-2 py-2 text-sm font-medium">
              <span className="w-4 shrink-0">
                <span className="sr-only">Select</span>
              </span>
              <span className="min-w-0 flex-1">Name</span>
              <span className="shrink-0">Actions</span>
            </div>
            {users.map((user) => (
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

          <div
            className={`hidden md:block border border-gray-200 overflow-x-auto ${
              isLoading ? "opacity-60" : ""
            }`}
          >
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="w-[5%] px-3 py-2 font-medium">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="w-[19%] px-3 py-2 font-medium">Name</th>
                  <th className="w-[10%] px-3 py-2 font-medium">Type</th>
                  <th className="w-[15%] px-3 py-2 font-medium">Status</th>
                  <th className="w-[20%] px-3 py-2 font-medium">Email</th>
                  <th className="w-[13%] px-3 py-2 font-medium whitespace-nowrap">
                    Created
                  </th>
                  <th className="w-[18%] px-3 py-2 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
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

      {totalPages > 1 && (
        <nav
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label="Users pagination"
        >
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className={paginationButtonClass(false, page <= 1 || isLoading)}
            aria-label="Previous page"
          >
            Prev
          </button>
          {visiblePages.map((pageNumber, index) => {
            const previous = visiblePages[index - 1];
            const showEllipsis =
              previous !== undefined && pageNumber - previous > 1;
            return (
              <span key={pageNumber} className="flex items-center gap-2">
                {showEllipsis && (
                  <span className="text-xs text-muted-foreground" aria-hidden>
                    …
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isLoading}
                  className={paginationButtonClass(
                    pageNumber === page,
                    isLoading
                  )}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className={paginationButtonClass(
              false,
              page >= totalPages || isLoading
            )}
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
