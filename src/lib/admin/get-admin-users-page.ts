import type { AdminUserListItem } from "@/types/admin-user";
import { buildAdminUserListItem } from "@/lib/admin/build-admin-user-list-item";
import { fetchAdminUserEnrichment } from "@/lib/admin/fetch-admin-user-enrichment";
import { fetchAdminUserIndex } from "@/lib/admin/fetch-admin-user-index";
import {
  listAllAuthUsers,
  type AuthUserSummary,
} from "@/lib/admin/list-all-auth-users";
import { getParticipantDisplayName } from "@/lib/participants/get-participant-display-name";
import { getVisitorDisplayName } from "@/lib/visitor/display-name";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMIN_USERS_PAGE_SIZE = 50;
export const ADMIN_USERS_MAX_PAGE_SIZE = 50;

export type AdminUsersCategory =
  | "all"
  | "participant"
  | "visitor"
  | "moderator";

export type AdminUsersSortBy = "name" | "status" | "createdAt";
export type AdminUsersCreatedAtFilter = "all" | "7d" | "30d" | "90d";

export type AdminUsersPageQuery = {
  page: number;
  limit: number;
  search: string;
  category: AdminUsersCategory;
  createdAtFilter: AdminUsersCreatedAtFilter;
  participantStatus: string;
  stickyFilter: string;
  activeFilter: string;
  specialProgramFilter: string;
  reactivationStatusFilter: string;
  sortBy: AdminUsersSortBy;
  sortOrder: "asc" | "desc";
};

export type AdminUsersPageResponse = {
  items: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type IndexCandidate = {
  userId: string;
  activityRank: number;
  entityType: "participant" | "visitor";
  isMod: boolean;
  displayName: string;
  email: string | null;
  createdAt: string | null;
  participantSlug?: string;
  participantStatus?: string;
  participantIsSticky?: boolean;
  participantIsActive?: boolean;
  participantCategory?: string;
  participantReactivationRequested?: boolean;
  participantReactivationStatus?: string | null;
  hasVisitorData?: boolean;
  isAuthOnly: boolean;
};

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  accepted: 1,
  declined: 2,
};

const CREATED_AT_FILTER_DAYS: Record<
  Exclude<AdminUsersCreatedAtFilter, "all">,
  number
> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getCreatedAtCutoff = (
  filter: AdminUsersCreatedAtFilter
): number | null => {
  if (filter === "all") return null;
  return Date.now() - CREATED_AT_FILTER_DAYS[filter] * MS_PER_DAY;
};

const getCreatedAtTimestamp = (createdAt: string | null): number | null => {
  if (!createdAt) return null;
  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const resolveActivityRank = (candidate: {
  participantStatus?: string;
  participantReactivationRequested?: boolean;
  participantReactivationStatus?: string | null;
  isAuthOnly: boolean;
}): number => {
  if (candidate.participantStatus === "pending") return 0;
  if (
    candidate.participantReactivationRequested &&
    candidate.participantReactivationStatus === "pending"
  ) {
    return 1;
  }
  if (!candidate.isAuthOnly) return 2;
  return 3;
};

const hasParticipantFilterActive = (query: AdminUsersPageQuery): boolean =>
  query.participantStatus !== "all" ||
  query.stickyFilter !== "all" ||
  query.activeFilter !== "all" ||
  query.specialProgramFilter !== "all" ||
  query.reactivationStatusFilter !== "all";

const needsAuthOnlyUniverse = (query: AdminUsersPageQuery): boolean => {
  if (query.category === "participant") return false;
  if (hasParticipantFilterActive(query)) return false;
  return true;
};

export const DEFAULT_ADMIN_USERS_PAGE_QUERY: AdminUsersPageQuery = {
  page: 1,
  limit: ADMIN_USERS_PAGE_SIZE,
  search: "",
  category: "all",
  createdAtFilter: "all",
  participantStatus: "all",
  stickyFilter: "all",
  activeFilter: "all",
  specialProgramFilter: "all",
  reactivationStatusFilter: "all",
  sortBy: "name",
  sortOrder: "asc",
};

export const clampAdminUsersPageQuery = (
  partial: Partial<AdminUsersPageQuery>
): AdminUsersPageQuery => {
  const page = Math.max(1, Math.floor(partial.page ?? 1) || 1);
  const rawLimit = Math.floor(partial.limit ?? ADMIN_USERS_PAGE_SIZE) || ADMIN_USERS_PAGE_SIZE;
  const limit = Math.min(
    ADMIN_USERS_MAX_PAGE_SIZE,
    Math.max(1, rawLimit)
  );

  const category = partial.category ?? "all";
  const sortBy = partial.sortBy ?? "name";
  const sortOrder = partial.sortOrder ?? "asc";
  const createdAtFilter = partial.createdAtFilter ?? "all";

  return {
    page,
    limit,
    search: (partial.search ?? "").trim(),
    category:
      category === "participant" ||
      category === "visitor" ||
      category === "moderator"
        ? category
        : "all",
    createdAtFilter:
      createdAtFilter === "7d" ||
      createdAtFilter === "30d" ||
      createdAtFilter === "90d"
        ? createdAtFilter
        : "all",
    participantStatus: partial.participantStatus ?? "all",
    stickyFilter: partial.stickyFilter ?? "all",
    activeFilter: partial.activeFilter ?? "all",
    specialProgramFilter: partial.specialProgramFilter ?? "all",
    reactivationStatusFilter: partial.reactivationStatusFilter ?? "all",
    sortBy:
      sortBy === "status" || sortBy === "createdAt" ? sortBy : "name",
    sortOrder: sortOrder === "desc" ? "desc" : "asc",
  };
};

const matchesCandidate = (
  candidate: IndexCandidate,
  query: AdminUsersPageQuery,
  createdAtCutoff: number | null
): boolean => {
  if (query.category === "participant" && candidate.entityType !== "participant") {
    return false;
  }
  if (query.category === "visitor" && candidate.entityType !== "visitor") {
    return false;
  }
  if (query.category === "moderator" && !candidate.isMod) {
    return false;
  }

  if (hasParticipantFilterActive(query) && candidate.entityType !== "participant") {
    return false;
  }

  if (createdAtCutoff !== null) {
    const createdAtTimestamp = getCreatedAtTimestamp(candidate.createdAt);
    if (createdAtTimestamp === null || createdAtTimestamp < createdAtCutoff) {
      return false;
    }
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    const matchesName = candidate.displayName.toLowerCase().includes(searchLower);
    const matchesEmail = candidate.email?.toLowerCase().includes(searchLower);
    const matchesId = candidate.userId.toLowerCase().includes(searchLower);
    const matchesSlug = candidate.participantSlug
      ?.toLowerCase()
      .includes(searchLower);

    if (!matchesName && !matchesEmail && !matchesId && !matchesSlug) {
      return false;
    }
  }

  if (candidate.entityType === "participant") {
    if (
      query.participantStatus !== "all" &&
      candidate.participantStatus !== query.participantStatus
    ) {
      return false;
    }
    if (query.stickyFilter === "sticky" && !candidate.participantIsSticky) {
      return false;
    }
    if (query.stickyFilter === "not_sticky" && candidate.participantIsSticky) {
      return false;
    }
    if (query.activeFilter === "active" && !candidate.participantIsActive) {
      return false;
    }
    if (query.activeFilter === "inactive" && candidate.participantIsActive) {
      return false;
    }
    if (
      query.specialProgramFilter === "yes" &&
      candidate.participantCategory === "standard"
    ) {
      return false;
    }
    if (
      query.specialProgramFilter === "no" &&
      candidate.participantCategory !== "standard"
    ) {
      return false;
    }
    if (
      query.reactivationStatusFilter !== "all" &&
      candidate.participantReactivationStatus !== query.reactivationStatusFilter
    ) {
      return false;
    }
  }

  return true;
};

const compareCandidates = (
  a: IndexCandidate,
  b: IndexCandidate,
  query: AdminUsersPageQuery
): number => {
  if (a.activityRank !== b.activityRank) {
    return a.activityRank - b.activityRank;
  }

  let cmp = 0;

  if (query.sortBy === "status" && query.category === "participant") {
    const aOrder = STATUS_ORDER[a.participantStatus ?? ""] ?? 99;
    const bOrder = STATUS_ORDER[b.participantStatus ?? ""] ?? 99;
    cmp = aOrder - bOrder;
    if (cmp === 0) {
      cmp = a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: "base",
      });
    }
  } else if (query.sortBy === "createdAt") {
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

  if (cmp === 0) {
    cmp = a.userId.localeCompare(b.userId);
  }

  return query.sortOrder === "asc" ? cmp : -cmp;
};

const buildRegisteredCandidates = (
  index: Awaited<ReturnType<typeof fetchAdminUserIndex>>,
  authById: Map<string, AuthUserSummary>
): IndexCandidate[] => {
  const visitorByUserId = new Map<string, (typeof index.visitors)[number]>();
  for (const visitor of index.visitors) {
    if (visitor.auth_user_id) {
      visitorByUserId.set(visitor.auth_user_id, visitor);
    }
  }

  const participantByUserId = new Map(
    index.participants.map((participant) => [participant.user_id, participant])
  );

  const registeredIds = new Set<string>([
    ...participantByUserId.keys(),
    ...visitorByUserId.keys(),
  ]);

  const candidates: IndexCandidate[] = [];

  for (const userId of registeredIds) {
    const participant = participantByUserId.get(userId);
    const visitor = visitorByUserId.get(userId);
    const auth = authById.get(userId);
    const entityType = participant ? "participant" : "visitor";

    const fromParticipant = participant
      ? getParticipantDisplayName({ display_name: participant.display_name })
      : "";
    const fromVisitor = visitor ? getVisitorDisplayName(visitor) : "";
    const displayName =
      (fromParticipant && fromParticipant !== "Unknown User"
        ? fromParticipant
        : "") ||
      fromVisitor ||
      auth?.email?.trim() ||
      "Unnamed User";

    const email =
      visitor?.email?.trim() || auth?.email?.trim() || null;

    const createdAt = auth?.created_at ?? visitor?.created_at ?? null;

    const candidate: IndexCandidate = {
      userId,
      activityRank: 2,
      entityType,
      isMod: index.modUserIds.has(userId),
      displayName,
      email,
      createdAt,
      isAuthOnly: false,
      hasVisitorData: Boolean(visitor),
    };

    if (participant) {
      candidate.participantSlug = participant.slug;
      candidate.participantStatus = participant.status;
      candidate.participantIsSticky = index.stickyParticipantIds.has(userId);
      candidate.participantIsActive = participant.is_active;
      candidate.participantCategory = participant.category;
      candidate.participantReactivationRequested =
        participant.reactivation_requested;
      candidate.participantReactivationStatus =
        participant.reactivation_status;
    }

    candidate.activityRank = resolveActivityRank(candidate);
    candidates.push(candidate);
  }

  return candidates;
};

const buildAuthOnlyCandidates = (
  authUsers: AuthUserSummary[],
  registeredIds: Set<string>,
  modUserIds: Set<string>
): IndexCandidate[] => {
  const candidates: IndexCandidate[] = [];

  for (const authUser of authUsers) {
    if (registeredIds.has(authUser.id)) continue;

    const email = authUser.email?.trim() || null;
    candidates.push({
      userId: authUser.id,
      activityRank: 3,
      entityType: "visitor",
      isMod: modUserIds.has(authUser.id),
      displayName: email || "Unnamed User",
      email,
      createdAt: authUser.created_at ?? null,
      isAuthOnly: true,
    });
  }

  return candidates;
};

const fetchAuthSummariesForIds = async (
  admin: SupabaseClient,
  userIds: string[],
  authById: Map<string, AuthUserSummary>
): Promise<AuthUserSummary[]> => {
  const summaries: AuthUserSummary[] = [];

  await Promise.all(
    userIds.map(async (userId) => {
      const cached = authById.get(userId);
      if (cached) {
        summaries.push(cached);
        return;
      }

      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error || !data.user) {
        summaries.push({
          id: userId,
          email: null,
          created_at: "",
        });
        return;
      }

      const summary: AuthUserSummary = {
        id: data.user.id,
        email: data.user.email ?? null,
        created_at: data.user.created_at,
      };
      authById.set(userId, summary);
      summaries.push(summary);
    })
  );

  return summaries;
};

export const getAdminUsersPage = async (
  admin: SupabaseClient,
  partialQuery: Partial<AdminUsersPageQuery> = {}
): Promise<AdminUsersPageResponse> => {
  const query = clampAdminUsersPageQuery(partialQuery);
  const createdAtCutoff = getCreatedAtCutoff(query.createdAtFilter);

  const includeAuthOnly = needsAuthOnlyUniverse(query);

  const [index, authUsers] = await Promise.all([
    fetchAdminUserIndex(admin),
    includeAuthOnly ? listAllAuthUsers(admin) : Promise.resolve([] as AuthUserSummary[]),
  ]);

  const authById = new Map(authUsers.map((user) => [user.id, user]));

  const registeredCandidates = buildRegisteredCandidates(index, authById);
  const registeredIds = new Set(registeredCandidates.map((c) => c.userId));

  const authOnlyCandidates = includeAuthOnly
    ? buildAuthOnlyCandidates(authUsers, registeredIds, index.modUserIds)
    : [];

  const filtered = [...registeredCandidates, ...authOnlyCandidates].filter(
    (candidate) => matchesCandidate(candidate, query, createdAtCutoff)
  );

  filtered.sort((a, b) => compareCandidates(a, b, query));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.limit;
  const pageCandidates = filtered.slice(start, start + query.limit);
  const pageIds = pageCandidates.map((candidate) => candidate.userId);

  if (pageIds.length === 0) {
    return {
      items: [],
      page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : totalPages,
    };
  }

  const [authSummaries, enrichment] = await Promise.all([
    fetchAuthSummariesForIds(admin, pageIds, authById),
    fetchAdminUserEnrichment(admin, pageIds),
  ]);

  const authSummaryById = new Map(
    authSummaries.map((summary) => [summary.id, summary])
  );

  const items = pageIds.map((userId) => {
    const authSummary = authSummaryById.get(userId) ?? {
      id: userId,
      email: null,
      created_at: "",
    };
    return buildAdminUserListItem(authSummary, enrichment);
  });

  return {
    items,
    page,
    limit: query.limit,
    total,
    totalPages: total === 0 ? 0 : totalPages,
  };
};

export const buildAdminUsersPageSearchParams = (
  query: Partial<AdminUsersPageQuery>
): URLSearchParams => {
  const clamped = clampAdminUsersPageQuery(query);
  const params = new URLSearchParams();
  params.set("page", String(clamped.page));
  params.set("limit", String(clamped.limit));
  if (clamped.search) params.set("search", clamped.search);
  if (clamped.category !== "all") params.set("category", clamped.category);
  if (clamped.createdAtFilter !== "all") {
    params.set("createdAt", clamped.createdAtFilter);
  }
  if (clamped.participantStatus !== "all") {
    params.set("participantStatus", clamped.participantStatus);
  }
  if (clamped.stickyFilter !== "all") {
    params.set("sticky", clamped.stickyFilter);
  }
  if (clamped.activeFilter !== "all") {
    params.set("active", clamped.activeFilter);
  }
  if (clamped.specialProgramFilter !== "all") {
    params.set("special", clamped.specialProgramFilter);
  }
  if (clamped.reactivationStatusFilter !== "all") {
    params.set("reactivation", clamped.reactivationStatusFilter);
  }
  if (clamped.sortBy !== "name") params.set("sortBy", clamped.sortBy);
  if (clamped.sortOrder !== "asc") params.set("sortOrder", clamped.sortOrder);
  return params;
};

export const parseAdminUsersPageSearchParams = (
  searchParams: URLSearchParams
): AdminUsersPageQuery =>
  clampAdminUsersPageQuery({
    page: Number(searchParams.get("page") ?? "1"),
    limit: Number(searchParams.get("limit") ?? String(ADMIN_USERS_PAGE_SIZE)),
    search: searchParams.get("search") ?? "",
    category: (searchParams.get("category") as AdminUsersCategory) ?? "all",
    createdAtFilter:
      (searchParams.get("createdAt") as AdminUsersCreatedAtFilter) ?? "all",
    participantStatus: searchParams.get("participantStatus") ?? "all",
    stickyFilter: searchParams.get("sticky") ?? "all",
    activeFilter: searchParams.get("active") ?? "all",
    specialProgramFilter: searchParams.get("special") ?? "all",
    reactivationStatusFilter: searchParams.get("reactivation") ?? "all",
    sortBy: (searchParams.get("sortBy") as AdminUsersSortBy) ?? "name",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "asc",
  });
