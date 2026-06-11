# Program migration — legacy `/events` cleanup

Public program browsing lives at `/program` with `GET /api/program`. The `/events` route redirects to `/program` via `next.config.mjs`.

## Removed (completed)

- `src/app/events/**` — public events UI
- `src/app/components/events/**` — event list components
- `src/hooks/useEventsLazy.ts`
- `src/app/hooks/useEventData.ts`
- `src/utils/api.ts` — `fetchEventsClient` and legacy event fetch helpers

## Keep (dashboard / admin)

- `src/app/api/events/**` (CRUD, participant, days, header-title)
- `src/schemas/eventsSchemas.ts`
- `src/app/dashboard/**` event flows
- `src/app/admin/events/**`
- `src/app/api/admin/events/**`
- `src/app/api/admin/main/tour-status/route.ts`
