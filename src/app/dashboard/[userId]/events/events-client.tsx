"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "lucide-react";
import type { EventSummary } from "@/lib/events/get-participant-events-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteImage } from "@/utils/supabase/storage/client";
import { useToast } from "@/hooks/use-toast";
import BigButton from "@/components/big-button";

type EventsClientProps = {
  targetUserId: string;
  events: EventSummary[];
  planMaxEvents: number;
  canCreateEvent: boolean;
};

type EventRowActionsProps = {
  event: EventSummary;
  targetUserId: string;
  onDelete: (event: EventSummary) => void;
  compact?: boolean;
};

const EventRowActions = ({
  event,
  targetUserId,
  onDelete,
  compact = false,
}: EventRowActionsProps) => (
  <div className="flex shrink-0 flex-wrap justify-end gap-1 md:gap-2">
    <Button asChild variant="secondary" size={compact ? "icon" : "sm"}>
      <Link
        href={`/dashboard/${targetUserId}/events/${event.id}`}
        aria-label={`Edit ${event.title}`}
      >
        <PencilIcon className={compact ? "h-4 w-4" : "mr-1 h-4 w-4"} />
        {!compact && "Edit"}
      </Link>
    </Button>
    <Button
      variant="destructive"
      size={compact ? "icon" : "sm"}
      onClick={() => onDelete(event)}
      aria-label={`Delete ${event.title}`}
    >
      <TrashIcon className={compact ? "h-4 w-4" : "mr-1 h-4 w-4"} />
      {!compact && "Delete"}
    </Button>
  </div>
);

export const EventsClient = ({
  targetUserId,
  events,
  planMaxEvents,
  canCreateEvent,
}: EventsClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<EventSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const helpText =
    planMaxEvents === 0
      ? "Your current plan does not allow events."
      : canCreateEvent
        ? `You can create up to ${planMaxEvents} event${planMaxEvents > 1 ? "s" : ""}. (${events.length}/${planMaxEvents} used)`
        : `You have reached your plan limit (${events.length}/${planMaxEvents}). Delete an event to create a new one.`;

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      if (deleteTarget.image_url) {
        await deleteImage(deleteTarget.image_url);
      }

      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });

      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-[30px] mini-padding">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-between w-full">
          <div>
            <h1 className="title-text">Events</h1>
            <p className="mt-1 text-sm text-muted-foreground">{helpText}</p>
          </div>
          {canCreateEvent && (

            <BigButton label="Add Event" href={`/dashboard/${targetUserId}/events/new`} mode="big" as="link" />
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t created any events yet.
          </p>
          {canCreateEvent && (
            <Button asChild className="mt-4">
              <Link href={`/dashboard/${targetUserId}/events/new`}>
                Add Event
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="md:hidden border min-w-0">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-2 py-2 text-sm font-medium">
              <span className="min-w-0 flex-1">Title</span>
              <span className="shrink-0">Actions</span>
            </div>
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 border-b px-2 py-2 last:border-b-0"
              >
                <p className="min-w-0 flex-1 text-sm font-medium wrap-break-word">
                  {event.title}
                </p>
                <EventRowActions
                  event={event}
                  targetUserId={targetUserId}
                  onDelete={setDeleteTarget}
                  compact
                />
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{event.type}</Badge>
                    </TableCell>
                    <TableCell>{event.dayLabel ?? event.dayId}</TableCell>
                    <TableCell>
                      {event.start_time} – {event.end_time}
                    </TableCell>
                    <TableCell>
                      <EventRowActions
                        event={event}
                        targetUserId={targetUserId}
                        onDelete={setDeleteTarget}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
