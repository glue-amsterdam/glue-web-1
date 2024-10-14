"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Contributor, Event } from "@/utils/event-types";

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
        <DialogHeader>
          <DialogTitle className="text-3xl">{event.name}</DialogTitle>
        </DialogHeader>
        <article>
          <figure className="relative w-full h-60 lg:h-[50vh] mb-4 overflow-hidden">
            <img
              src={event.thumbnail}
              alt={event.name}
              className="rounded-md object-cover absolute inset-0 -translate-y-10 lg:translate-y-0"
            />
          </figure>
          <div className="flex flex-wrap gap-5">
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
            <div className="flex gap-10">
              <div>
                <h3 className=" font-bold text-xl mb-2">Creator</h3>
                <p>{event.creator.name}</p>
              </div>
              <div className="flex-1">
                <h3 className=" font-bold text-xl mb-2">Contributors</h3>
                <ul className="list-disc list-inside">
                  {event.contributors.map((contributor: Contributor) => (
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
