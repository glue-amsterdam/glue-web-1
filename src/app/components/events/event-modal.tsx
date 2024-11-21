"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { dotToHyphen, isRSVPRequiredEvent } from "@/constants";
import { IndividualEventResponse, EnhancedUser } from "@/schemas/eventSchemas";
import { MapInfo } from "@/app/components/map-info";

export function EventModal() {
  const [event, setEvent] = useState<IndividualEventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        setEvent(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("eventId");
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <Dialog open={!!eventId} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-[90%] md:max-w-[60vw] max-h-[90vh] bg-background text-black overflow-y-auto">
        {isLoading ? (
          <EventSkeleton />
        ) : event ? (
          <EventContent event={event} />
        ) : (
          <div className="text-center py-8">No event data available</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EventSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-60 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

function EventContent({ event }: { event: IndividualEventResponse }) {
  return (
    <div className="flex flex-col space-y-4">
      <article className="flex justify-between text-black">
        <DialogTitle className="text-3xl">{event.name}</DialogTitle>
        {isRSVPRequiredEvent(event) && (
          <div className="text-center">
            <Button asChild>
              <a
                href={event.rsvpLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP
              </a>
            </Button>
            <p className="text-sm mt-2">{event.rsvpMessage}</p>
          </div>
        )}
      </article>
      <article className="flex flex-col space-y-4">
        <figure className="relative w-full h-60 lg:h-[40vh] overflow-hidden">
          <img
            src={event.thumbnail.imageUrl}
            alt={event.name}
            className="rounded-md object-cover w-full h-full"
          />
        </figure>
        <div className="flex flex-col lg:flex-row gap-4 text-black">
          <div className="flex-1">
            <time
              className="text-sm text-muted-foreground mb-2 block italic"
              dateTime={`${event.date}T${event.startTime}`}
            >
              {new Date(event.date.date).toLocaleDateString()} |{" "}
              {event.startTime} - {event.endTime}
            </time>
            <p className="mb-4 text-sm">{event.description}</p>
          </div>
          <div className="flex gap-8 text-black">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1">Organizer</h3>
              {event.organizer.slug ? (
                <Link
                  target="_blank"
                  href={`/participants/${event.organizer.slug}`}
                  className="text-sm hover:underline"
                >
                  {event.organizer.userName}
                </Link>
              ) : (
                <p className="text-sm">{event.organizer.userName}</p>
              )}
            </div>
            {event.coOrganizers && event.coOrganizers.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-1">Co organizer</h3>
                <ul className="text-sm text-center">
                  {event.coOrganizers.map((contributor: EnhancedUser) => (
                    <li key={contributor.userId}>
                      {contributor.slug ? (
                        <Link
                          target="_blank"
                          href={`/participants/${contributor.slug}`}
                          className="hover:underline"
                        >
                          {contributor.userName}
                        </Link>
                      ) : (
                        contributor.userName
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {event.organizer.mapId && (
          <Link
            target="_blank"
            href={`/map/${dotToHyphen(event.organizer.mapId)}`}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapInfo mapId={event.organizer.mapId} />
            </div>
          </Link>
        )}
      </article>
    </div>
  );
}
