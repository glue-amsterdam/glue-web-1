import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EventForm } from "@/app/dashboard/[userId]/events/components/create-event-form";
import {
  getAllAvailableEventLocations,
  getAvailableEventLocations,
} from "@/lib/events/get-available-event-locations";
import { getParticipantEventsSummary } from "@/lib/events/get-participant-events-summary";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { getPlanMaxEventsForUser } from "@/lib/plans/get-plan-max-events-for-user";
import { createClient } from "@/utils/supabase/server";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  return generateDashboardSectionMetadata(userId, "Create Event");
}

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const [events, planMaxEvents, availableLocations] = await Promise.all([
    getParticipantEventsSummary(userId),
    getPlanMaxEventsForUser(userId),
    getAvailableEventLocations(supabase, userId),
  ]);

  const eventCount = events.length;
  const canCreateEvent = planMaxEvents > 0 && eventCount < planMaxEvents;
  const hasAvailableLocations =
    getAllAvailableEventLocations(availableLocations).length > 0;

  return (
    <div className="py-6">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/dashboard/${userId}/events`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </Button>

      {planMaxEvents === 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Events Not Available</AlertTitle>
          <AlertDescription>
            Your current plan does not allow events.
          </AlertDescription>
        </Alert>
      ) : !canCreateEvent ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Event Limit Reached</AlertTitle>
          <AlertDescription>
            You have reached the maximum number of events allowed (
            {eventCount}/{planMaxEvents}). Please delete an existing event
            before creating a new one.
          </AlertDescription>
        </Alert>
      ) : !hasAvailableLocations ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Locations Available</AlertTitle>
          <AlertDescription>
            You need your own address or membership in a hub with a location
            before you can create an event. Update your map location or contact
            your hub host.
          </AlertDescription>
        </Alert>
      ) : (
        <EventForm
          targetUserId={userId}
          existingEventCount={eventCount}
          planMaxEvents={planMaxEvents}
          canCreateEvent={canCreateEvent}
          hasAvailableLocations={hasAvailableLocations}
        />
      )}
    </div>
  );
}
