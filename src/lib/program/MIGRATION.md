# Program migration — legacy `/events` cleanup

Public program browsing lives at `/program` with `GET /api/program`. The `/events` route remains temporarily.

## Safe to remove when `/events` is retired

- `src/app/events/page.tsx`
- `src/app/events/events-client-page.tsx`
- `src/app/events/layout.tsx`
- `src/app/components/events/event-header.tsx`
- `src/app/components/events/search-and-filter-events.tsx`
- `src/app/components/events/event-list-container.tsx`
- `src/app/components/events/lazy-events-list.tsx`
- `src/app/components/events/events-list.tsx`
- `src/app/components/events/event-card.tsx`
- `src/app/components/events/event-modal.tsx`
- `src/app/components/events/event-content.tsx`
- `src/app/components/events/event-skeleton.tsx`
- `src/hooks/useEventsLazy.ts`
- `src/app/hooks/useEventData.ts`

## Refactor / deprecate later

- `src/utils/api.ts` — `fetchEventsClient`, unused `fetchEvents` / `fetchEventById` if no callers
- `src/schemas/eventSchemas.ts` — keep for dashboard; align or re-export from `program-types` if useful
- `GET /api/events` (list) — deprecate for public UI once `/events` is removed

## Keep (dashboard / admin)

- `src/app/api/events/**` (CRUD, participant, days, header-title)
- `src/schemas/eventsSchemas.ts`
- `src/app/dashboard/**` event flows
- `src/app/admin/events/**`
- `src/app/api/admin/events/**`
- `src/app/api/admin/main/tour-status/route.ts`
