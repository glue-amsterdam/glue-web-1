"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Event, Organizer } from "@/utils/event-types";
import { Button } from "@/components/ui/button";

export function EventModal() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (eventId) {
      fetchEvent(eventId);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchParams]);

  const fetchEvent = async (eventId: string) => {
    const res = await fetch(`/api/events/${eventId}`);
    if (res.ok) {
      const data = await res.json();
      setEvent(data);
    }
  };

  const handleClose = () => {
    router.push("/events", { scroll: false });
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90%] md:max-w-[60vw] bg-uiwhite text-uiblack">
        <article className="flex justify-between">
          <DialogTitle className="text-3xl">{event.name}</DialogTitle>
          {event.rsvp && (
            <div className="text-center">
              <Button>
                <a target="_blank" href={event.rsvpLink}>
                  RSVP
                </a>
              </Button>
              <p>{event.rsvpMessage}</p>
            </div>
          )}
        </article>
        <article>
          <figure className="relative w-full h-60 lg:h-[50vh] mb-4 overflow-hidden">
            <img
              src={event.thumbnail.imageUrl}
              alt={event.name}
              className="rounded-md object-cover absolute inset-0 -translate-y-10 lg:translate-y-0"
            />
          </figure>
          <div className="flex flex-wrap gap-2">
            <div className="flex-1">
              <time
                className="text-sm text-gray-500 mb-2 block italic"
                dateTime={`${event.date}T${event.startTime}`}
              >
                {new Date(event.date).toLocaleDateString()} | {event.startTime}{" "}
                - {event.endTime}
              </time>
              <p className="mb-4 text-sm">{event.description}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">Organizer</h3>
                <p className="text-sm">{event.organizer.name}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Co organizer</h3>
                <ul className="text-sm text-center">
                  {event.coOrganizers.map((contributor: Organizer) => (
                    <li key={contributor.id}>{contributor.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
      </DialogContent>
    </Dialog>
  );
}
