"use client";

import MapInfoServer from "@/app/components/map-info-server";
import { Button } from "@/components/ui/button";
import { isRSVPRequiredEvent } from "@/constants";
import { EnhancedUser, IndividualEventResponse } from "@/schemas/eventSchemas";
import { DialogTitle, DialogContent } from "@radix-ui/react-dialog";
import { Link } from "lucide-react";
import { Suspense } from "react";

export default function EventContent({
  event,
}: {
  event: IndividualEventResponse;
}) {
  return (
    <DialogContent className="max-w-[90%] md:max-w-[60vw] max-h-[90vh] bg-background text-black overflow-y-auto">
      <div className="flex flex-col space-y-4">
        <DialogTitle className="text-3xl">{event.name}</DialogTitle>
        <article className="flex justify-between text-black">
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
                      <li
                        key={
                          contributor.userId + (Math.random() * 100).toString()
                        }
                      >
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
            <Link target="_blank" href={`/map/${event.organizer.mapId}`}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Suspense fallback={<div>Loading map info...</div>}>
                  <MapInfoServer mapId={event.organizer.mapId} />
                </Suspense>
              </div>
            </Link>
          )}
        </article>
      </div>
    </DialogContent>
  );
}
