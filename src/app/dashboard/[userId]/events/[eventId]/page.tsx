import Link from "next/link";
import { notFound } from "next/navigation";
import { EditEventForm } from "@/app/dashboard/[userId]/events/[eventId]/edit-event-form";
import { getParticipantEventById } from "@/lib/events/get-participant-event-by-id";
import { generateDashboardSectionMetadata } from "@/lib/metadata/build-dashboard-metadata";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}): Promise<Metadata> {
  const { userId, eventId } = await params;
  const event = await getParticipantEventById(userId, eventId);
  return generateDashboardSectionMetadata(userId, event?.title ?? "Edit Event");
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ userId: string; eventId: string }>;
}) {
  const { userId, eventId } = await params;

  const event = await getParticipantEventById(userId, eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="py-6">
      <Button asChild variant="ghost" className="mb-4">
        <Link href={`/dashboard/${userId}/events`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </Button>
      <EditEventForm event={event} targetUserId={userId} />
    </div>
  );
}
