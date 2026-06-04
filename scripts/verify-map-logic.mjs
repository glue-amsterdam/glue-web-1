/**
 * Map phase-1 QA checks (no bundler required).
 * Usage: node scripts/verify-map-logic.mjs
 */

const filterMapRoutes = (routes, q) => {
  const query = q.trim().toLowerCase();
  if (!query) return routes;
  return routes.filter(
    (route) =>
      route.name.toLowerCase().includes(query) ||
      route.zone.toLowerCase().includes(query) ||
      (route.description?.toLowerCase().includes(query) ?? false) ||
      route.dots.some((dot) => dot.name.toLowerCase().includes(query))
  );
};

const classifyLocationType = (memberCount, primarySpecialProgram) => {
  if (memberCount > 3) return "hub";
  if (memberCount === 1 && primarySpecialProgram) return "special-program";
  return "up-to-three-participants";
};

const getMapLocationProfileLink = (location) => {
  if (location.hubId && location.memberCount > 1) {
    return `/exhibitors/hub/${location.hubId}`;
  }
  if (location.slug) return `/exhibitors/${location.slug}`;
  if (location.hubId) return `/exhibitors/hub/${location.hubId}`;
  return null;
};

const legacyType = (location, memberCount) => {
  if (location.is_hub || memberCount > 3) return "hub";
  if (location.is_special_program && memberCount === 1) return "special-program";
  return classifyLocationType(
    memberCount,
    location.is_special_program && memberCount === 1
  );
};

const normalizeLegacyLocation = (location) => {
  const memberCount = location.participants?.length ?? 0;
  const host =
    location.participants.find((participant) => participant.is_host) ??
    location.participants[0];
  const isMultiMemberHub =
    location.is_hub || Boolean(location.hub_name) || memberCount > 1;

  return {
    id: location.id,
    type: legacyType(location, memberCount),
    name: location.hub_name ?? host?.user_name ?? "Unknown",
    displayNumber:
      location.hub_display_number ??
      location.display_number ??
      host?.display_number ??
      null,
    slug: isMultiMemberHub ? undefined : host?.slug,
    memberCount: Math.max(memberCount, 1),
  };
};

const assert = (name, condition, detail) => ({
  name,
  passed: Boolean(condition),
  detail: condition ? undefined : detail,
});

const DEFAULT_MAP_FILTERS = { view: "none", type: "all", q: "" };

const appendMapFilterParams = (searchParams, filters) => {
  const next = new URLSearchParams(searchParams.toString());
  if (filters.view !== DEFAULT_MAP_FILTERS.view) {
    next.set("view", filters.view);
  } else {
    next.delete("view");
  }
  if (filters.type !== DEFAULT_MAP_FILTERS.type) {
    next.set("type", filters.type);
  } else {
    next.delete("type");
  }
  if (filters.q.trim()) {
    next.set("q", filters.q.trim());
  } else {
    next.delete("q");
  }
  return next;
};

const buildMapPageUrl = (
  pathname,
  filters,
  currentSearchParams,
  selection,
  options
) => {
  if (
    options?.mobile &&
    selection?.route &&
    !selection?.place &&
    !selection?.clearSelection
  ) {
    return `${pathname}?route=${encodeURIComponent(selection.route)}`;
  }

  let resolvedFilters = filters;

  if (options?.mobile && selection?.place) {
    resolvedFilters = { ...resolvedFilters, view: "none" };
    if (options.clearSearch) {
      resolvedFilters = { ...resolvedFilters, q: "" };
    }
  }

  const searchParams = appendMapFilterParams(
    new URLSearchParams(currentSearchParams.toString()),
    resolvedFilters
  );
  if (selection?.clearSelection) {
    searchParams.delete("place");
    searchParams.delete("route");
  } else if (selection?.place) {
    searchParams.set("place", selection.place);
    searchParams.delete("route");
  } else if (selection?.route) {
    searchParams.set("route", selection.route);
    searchParams.delete("place");
  }
  const queryString = searchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

const shouldClearMapSelectionForExhibitorsView = (merged, selection) =>
  merged.view === "exhibitors" &&
  !selection?.place &&
  !selection?.route;

const resolveMapPageSelection = (merged, selection) =>
  shouldClearMapSelectionForExhibitorsView(merged, selection)
    ? { ...selection, clearSelection: true }
    : selection;

/** Mirrors URL → selection sync rules in useMapPageState (for regression tests). */
const computeSyncedSelection = ({
  searchParamsString,
  selectedLocation,
  selectedRoute,
  isUpdatingUrl = false,
  pendingPlaceId = null,
  pendingRouteId = null,
}) => {
  const params = new URLSearchParams(searchParamsString);
  const placeId = params.get("place");
  const routeId = params.get("route");
  const hasQueryParams = searchParamsString.length > 0;

  if (!hasQueryParams) {
    return { selectedLocation: null, selectedRoute: null };
  }

  if (placeId) {
    if (pendingRouteId) {
      return { selectedLocation, selectedRoute };
    }

    return { selectedLocation: placeId, selectedRoute: null };
  }

  if (routeId) {
    if (selectedLocation && !placeId) {
      return { selectedLocation, selectedRoute };
    }
    return { selectedLocation: null, selectedRoute: routeId };
  }

  if (isUpdatingUrl || pendingPlaceId || pendingRouteId) {
    return { selectedLocation, selectedRoute };
  }

  return {
    selectedLocation: selectedLocation !== null ? null : selectedLocation,
    selectedRoute: selectedRoute !== null ? null : selectedRoute,
  };
};

const sampleRoutes = [
  {
    id: "r1",
    name: "North Walk",
    description: "A scenic path",
    zone: "north",
    dots: [{ name: "Stop Alpha" }],
  },
  {
    id: "r2",
    name: "South Loop",
    description: null,
    zone: "south",
    dots: [{ name: "Other" }],
  },
];

const checks = [
  assert(
    "buildMapPageUrl preserves place when clearing view",
    (() => {
      const current = new URLSearchParams("place=abc&view=exhibitors&type=all");
      const url = buildMapPageUrl(
        "/map",
        { view: "none", type: "all", q: "" },
        current
      );
      return url.includes("place=abc") && !url.includes("view=");
    })()
  ),
  assert(
    "buildMapPageUrl sets place explicitly when provided",
    buildMapPageUrl(
      "/map",
      DEFAULT_MAP_FILTERS,
      new URLSearchParams(),
      { place: "xyz" }
    ) === "/map?place=xyz"
  ),
  assert(
    "buildMapPageUrl clearSelection removes route",
    (() => {
      const current = new URLSearchParams("route=r1&type=all");
      const url = buildMapPageUrl(
        "/map",
        { type: "hub", q: "", view: "none" },
        current,
        { clearSelection: true }
      );
      return url.includes("type=hub") && !url.includes("route=");
    })()
  ),
  assert(
    "buildMapPageUrl clearSelection removes route when opening exhibitors view",
    (() => {
      const current = new URLSearchParams("route=r1&q=walk");
      const filters = { view: "exhibitors", type: "all", q: "walk" };
      const url = buildMapPageUrl(
        "/map",
        filters,
        current,
        resolveMapPageSelection(filters)
      );
      return (
        url.includes("view=exhibitors") &&
        url.includes("q=walk") &&
        !url.includes("route=")
      );
    })()
  ),
  assert(
    "shouldClearMapSelectionForExhibitorsView keeps explicit place",
    !shouldClearMapSelectionForExhibitorsView(
      { view: "exhibitors", type: "all", q: "" },
      { place: "hub1" }
    )
  ),
  assert(
    "buildMapPageUrl mobile place clears view and sets place",
    (() => {
      const current = new URLSearchParams("view=exhibitors&type=hub");
      const url = buildMapPageUrl(
        "/map",
        { view: "none", type: "hub", q: "" },
        current,
        { place: "loc1" },
        { mobile: true }
      );
      return (
        url.includes("place=loc1") &&
        url.includes("type=hub") &&
        !url.includes("view=")
      );
    })()
  ),
  assert(
    "buildMapPageUrl mobile route-only URL",
    buildMapPageUrl(
      "/map",
      DEFAULT_MAP_FILTERS,
      new URLSearchParams("view=exhibitors"),
      { route: "r1" },
      { mobile: true }
    ) === "/map?route=r1"
  ),
  assert(
    "sync: filter-only URL clears stale location selection",
    (() => {
      const result = computeSyncedSelection({
        searchParamsString: "view=exhibitors",
        selectedLocation: "hub1",
        selectedRoute: null,
      });
      return result.selectedLocation === null && result.selectedRoute === null;
    })()
  ),
  assert(
    "sync: filter-only URL keeps pending place while URL updates",
    (() => {
      const result = computeSyncedSelection({
        searchParamsString: "view=exhibitors",
        selectedLocation: "hub1",
        selectedRoute: null,
        pendingPlaceId: "hub1",
      });
      return result.selectedLocation === "hub1" && result.selectedRoute === null;
    })()
  ),
  assert(
    "sync: filter-only URL clears stale route selection",
    (() => {
      const result = computeSyncedSelection({
        searchParamsString: "view=exhibitors",
        selectedLocation: null,
        selectedRoute: "r1",
      });
      return result.selectedLocation === null && result.selectedRoute === null;
    })()
  ),
  assert(
    "sync: pending route avoids restoring place from stale URL",
    (() => {
      const result = computeSyncedSelection({
        searchParamsString: "place=hub1",
        selectedLocation: null,
        selectedRoute: "r1",
        pendingRouteId: "r1",
      });
      return result.selectedLocation === null && result.selectedRoute === "r1";
    })()
  ),
  assert(
    "sync: place in URL clears route",
    (() => {
      const result = computeSyncedSelection({
        searchParamsString: "place=hub1",
        selectedLocation: null,
        selectedRoute: "r1",
      });
      return result.selectedLocation === "hub1" && result.selectedRoute === null;
    })()
  ),
  assert(
    "sync: stale route URL does not override pending place",
    (() => {
      const result = computeSyncedSelection({
        searchParamsString: "route=r1&view=exhibitors",
        selectedLocation: "hub1",
        selectedRoute: null,
      });
      return (
        result.selectedLocation === "hub1" && result.selectedRoute === null
      );
    })()
  ),
  assert(
    "filterMapRoutes matches route name",
    filterMapRoutes(sampleRoutes, "north").length === 1 &&
      filterMapRoutes(sampleRoutes, "north")[0].id === "r1"
  ),
  assert(
    "filterMapRoutes matches dot name",
    filterMapRoutes(sampleRoutes, "alpha").length === 1
  ),
  assert(
    "filterMapRoutes empty query returns all",
    filterMapRoutes(sampleRoutes, "  ").length === 2
  ),
  assert("hub type at 4 members", classifyLocationType(4, false) === "hub"),
  assert(
    "up-to-three at 3 members",
    classifyLocationType(3, false) === "up-to-three-participants"
  ),
  assert(
    "special-program only when solo + flag",
    classifyLocationType(1, true) === "special-program" &&
      classifyLocationType(2, true) === "up-to-three-participants"
  ),
  assert(
    "profile link prefers hub for multi-member",
    getMapLocationProfileLink({
      slug: "host-slug",
      hubId: "hub-abc",
      memberCount: 2,
    }) === "/exhibitors/hub/hub-abc"
  ),
  assert(
    "profile link uses slug for solo participant",
    getMapLocationProfileLink({ slug: "solo-slug", memberCount: 1 }) ===
      "/exhibitors/solo-slug"
  ),
];

const MARKER_STACK_ORDER = {
  hub: 0,
  "up-to-three-participants": 1,
  "special-program": 2,
};

const getMarkerSortKey = (type, index) => {
  const stack = type === "route" ? 0 : MARKER_STACK_ORDER[type];
  return stack * 1000 + index;
};

const sortMapLocationsForMarkers = (locations) =>
  [...locations].sort(
    (a, b) => MARKER_STACK_ORDER[a.type] - MARKER_STACK_ORDER[b.type]
  );

const stackSample = [
  { id: "sp", type: "special-program" },
  { id: "hub", type: "hub" },
  { id: "u3", type: "up-to-three-participants" },
];

const stackSorted = sortMapLocationsForMarkers(stackSample);

checks.push(
  assert(
    "marker stack: hub first in source order",
    stackSorted[0].type === "hub"
  ),
  assert(
    "marker stack: special-program last in source order",
    stackSorted[stackSorted.length - 1].type === "special-program"
  ),
  assert(
    "marker sortKey: special-program above hub",
    getMarkerSortKey("special-program", 0) > getMarkerSortKey("hub", 0)
  ),
  assert(
    "marker sortKey: up-to-three above hub",
    getMarkerSortKey("up-to-three-participants", 0) > getMarkerSortKey("hub", 0)
  )
);

const legacyFixture = {
  id: "legacy-1",
  participants: [
    {
      user_id: "host-1",
      user_name: "Host Name",
      is_host: true,
      slug: "host-slug",
      display_number: "5",
    },
    { user_id: "member-2", user_name: "Member", is_host: false },
  ],
  is_hub: false,
  hub_name: "Small Hub",
  is_special_program: false,
  hub_display_number: "99",
};

const legacy = normalizeLegacyLocation(legacyFixture);
checks.push(
  assert("legacy snapshot uses hub_name", legacy.name === "Small Hub"),
  assert("legacy snapshot hub display number", legacy.displayNumber === "99"),
  assert(
    "legacy snapshot type for 2 members",
    legacy.type === "up-to-three-participants"
  ),
  assert("legacy snapshot clears slug for multi-member hub", legacy.slug === undefined)
);

let failed = 0;
console.log("=== Map QA: logic checks ===\n");
for (const result of checks) {
  console.log(`${result.passed ? "PASS" : "FAIL"}  ${result.name}`);
  if (result.detail) console.log(`       ${result.detail}`);
  if (!result.passed) failed += 1;
}

console.log("\n=== Manual QA checklist (browser) ===");
console.log("1. Hub with 3 members → orange marker (up-to-three-participants)");
console.log("2. Hub with 4+ members → blue marker (hub)");
console.log("3. Sticky inactive participant still visible on /map");
console.log("4. Admin close tour → snapshot matches live ids/types/numbers");
console.log("5. Admin open tour → live data returns");
console.log("6. Popup in tour new → GET /api/map/locations/[id] once");
console.log("7. Popup in tour older → no detail fetch");
console.log("8. Routes: login gate, line, PDF, Google Maps");
console.log("9. Map dots visible on first load (no pan required)");
console.log("10. Pan/zoom/click map: dots stay aligned, no flash");
console.log("11. Click dot → LocationPopup; click empty map → close");
console.log(
  "12. Overlapping dots: special-program on top, then up-to-three, hub behind"
);
console.log(
  "\nRLS parity: run against staging with env loaded — public and anon clients should return the same marker ids/types."
);

process.exit(failed > 0 ? 1 : 0);
