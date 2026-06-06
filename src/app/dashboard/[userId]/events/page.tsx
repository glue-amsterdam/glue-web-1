import { EventsClient } from "@/app/dashboard/[userId]/events/events-client";
import { getParticipantEventsSummary } from "@/lib/events/get-participant-events-summary";
import { getPlanMaxEventsForUser } from "@/lib/plans/get-plan-max-events-for-user";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [events, planMaxEvents] = await Promise.all([
    getParticipantEventsSummary(userId),
    getPlanMaxEventsForUser(userId),
  ]);

  const eventCount = events.length;
  const canCreateEvent =
    planMaxEvents > 0 && eventCount < planMaxEvents;

  return (
    <EventsClient
      targetUserId={userId}
      events={events}
      planMaxEvents={planMaxEvents}
      canCreateEvent={canCreateEvent}
    />
  );
}
