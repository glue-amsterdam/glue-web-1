import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminUserListItem } from "@/types/admin-user";
import { filterAdminUsers } from "./filter-admin-users";

const baseUser = (
  overrides: Partial<AdminUserListItem> = {}
): AdminUserListItem => ({
  userId: "user-1",
  entityType: "visitor",
  displayName: "Test User",
  email: "test@example.com",
  createdAt: "2026-03-01T12:00:00.000Z",
  isMod: false,
  ...overrides,
});

describe("filterAdminUsers", () => {
  it("excludes visitors without hasVisitorData", () => {
    const users = [
      baseUser({
        userId: "registered",
        hasVisitorData: true,
      }),
      baseUser({
        userId: "orphan-auth",
        hasVisitorData: undefined,
      }),
    ];

    const matched = filterAdminUsers(users, {
      category: "visitor",
      participantStatus: "all",
      createdFrom: "",
      createdTo: "",
      visitorAreaId: "all",
    });

    assert.equal(matched.length, 1);
    assert.equal(matched[0]?.userId, "registered");
  });

  it("filters visitors by area and none", () => {
    const users = [
      baseUser({
        userId: "with-area",
        hasVisitorData: true,
        visitorAreaId: "area-a",
        visitorAreaName: "Centre",
      }),
      baseUser({
        userId: "no-area",
        hasVisitorData: true,
        visitorAreaId: null,
      }),
    ];

    const byArea = filterAdminUsers(users, {
      category: "visitor",
      participantStatus: "all",
      createdFrom: "",
      createdTo: "",
      visitorAreaId: "area-a",
    });
    assert.deepEqual(
      byArea.map((user) => user.userId),
      ["with-area"]
    );

    const none = filterAdminUsers(users, {
      category: "visitor",
      participantStatus: "all",
      createdFrom: "",
      createdTo: "",
      visitorAreaId: "none",
    });
    assert.deepEqual(
      none.map((user) => user.userId),
      ["no-area"]
    );
  });

  it("filters participants by status and created date range", () => {
    const users = [
      baseUser({
        userId: "accepted-in-range",
        entityType: "participant",
        participantStatus: "accepted",
        createdAt: "2026-06-15T10:00:00.000Z",
      }),
      baseUser({
        userId: "pending-in-range",
        entityType: "participant",
        participantStatus: "pending",
        createdAt: "2026-06-15T10:00:00.000Z",
      }),
      baseUser({
        userId: "accepted-out-of-range",
        entityType: "participant",
        participantStatus: "accepted",
        createdAt: "2025-01-01T10:00:00.000Z",
      }),
    ];

    const matched = filterAdminUsers(users, {
      category: "participant",
      participantStatus: "accepted",
      createdFrom: "2026-01-01",
      createdTo: "2026-12-31",
      visitorAreaId: "all",
    });

    assert.deepEqual(
      matched.map((user) => user.userId),
      ["accepted-in-range"]
    );
  });

  it("prefers visitorCreatedAt for date filtering", () => {
    const users = [
      baseUser({
        userId: "visitor-new",
        hasVisitorData: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        visitorCreatedAt: "2026-04-01T12:00:00.000Z",
      }),
    ];

    const matched = filterAdminUsers(users, {
      category: "visitor",
      participantStatus: "all",
      createdFrom: "2026-01-01",
      createdTo: "2026-12-31",
      visitorAreaId: "all",
    });

    assert.equal(matched.length, 1);
  });
});
