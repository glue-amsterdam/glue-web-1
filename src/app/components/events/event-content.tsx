"use client";

import { Button } from "@/components/ui/button";
import { isRSVPRequiredEvent } from "@/constants";
import { EnhancedUser, IndividualEventResponse } from "@/schemas/eventSchemas";
import { MapLocationEnhaced } from "@/schemas/mapSchema";
import { MapPinIcon as MapPinCheck } from "lucide-react";
import Link from "next/link";

interface EventContentProps {
  event: IndividualEventResponse;
  mapData: MapLocationEnhaced | null;
}

export default function EventContent({ event, mapData }: EventContentProps) {
  console.log("organizer :", event.organizer);
  console.log("co organizers :", event.coOrganizers);
  return (
    <>
      <div className="flex flex-col space-y-4 font-overpass">
        <div className=" flex justify-between">
          <h2 className="text-3xl font-bold">{event.name}</h2>
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
        </div>
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
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/participants/${event.organizer.slug}`}
                    className="text-sm hover:underline"
                    target="_blank"
                  >
                    {event.organizer.userName}
                  </Link>
                </div>
              </div>
              {event.coOrganizers && event.coOrganizers.length > 0 && (
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">Co organizer</h3>
                  <ul className="flex flex-col gap-2">
                    {event.coOrganizers.map((contributor: EnhancedUser) => (
                      <li
                        key={
                          contributor.userId + (Math.random() * 100).toString()
                        }
                        className="flex items-center justify-center gap-2"
                      >
                        <Link
                          href={`/participants/${contributor.slug}`}
                          className="text-sm hover:underline"
                          target="_blank"
                        >
                          {contributor.userName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {mapData && (
            <div>
              <a
                className="flex gap-1"
                target="_blank"
                href={`/map?placeid=${mapData.mapbox_id}`}
              >
                <MapPinCheck />
                <p>{mapData.place_name}</p>
              </a>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
