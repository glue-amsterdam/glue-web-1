"use client";

import { Button } from "@/components/ui/button";
import { getEventIcon, isRSVPRequiredEvent } from "@/constants";
import type {
  EnhancedUser,
  IndividualEventWithMapResponse,
} from "@/schemas/eventSchemas";
import { MapPinIcon as MapPinCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventContentProps {
  event: IndividualEventWithMapResponse;
}

export default function EventContent({ event }: EventContentProps) {
  const EventIcon = getEventIcon(event.type);
  return (
    <>
      <div className="flex flex-col space-y-4 font-overpass">
        <div className=" flex justify-between">
          <h3 className="text-3xl font-bold">
            {" "}
            <div className="flex items-center gap-2">
              <span>
                <EventIcon className="size-3 md:size-4 lg:size-6" />
              </span>
              <p className="text-xs md:text-sm lg:text-base">{event.type}</p>
            </div>
            {event.name}
          </h3>
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
          <figure className="relative w-full flex justify-center items-start overflow-hidden">
            <Image
              src={event.thumbnail.image_url || "/placeholder.svg"}
              width={1920}
              height={1080}
              alt={`Event from the GLUE community: ${event.name} - ${event.type} type`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              className="w-full h-auto max-h-[60vh] object-contain"
              quality={95}
            />
          </figure>
          <div className="flex flex-col lg:flex-row gap-4 text-black">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2 block">
                {event.date.label} {event.startTime} - {event.endTime}
              </p>
              <p className="mb-4 text-sm">{event.description}</p>
            </div>
            <div className="flex gap-8 text-black">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">Organiser</h3>
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/participants/${event.organizer.slug}`}
                    className="text-sm hover:underline"
                    target="_blank"
                  >
                    {event.organizer.user_name}
                  </Link>
                </div>
              </div>
              {event.coOrganizers && event.coOrganizers.length > 0 && (
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">Co-organiser</h3>
                  <ul className="flex flex-col gap-2">
                    {event.coOrganizers.map((contributor: EnhancedUser) => (
                      <li
                        key={
                          contributor.user_id + (Math.random() * 100).toString()
                        }
                        className="flex items-center justify-center gap-2"
                      >
                        <Link
                          href={`/participants/${contributor.slug}`}
                          className="text-sm hover:underline"
                          target="_blank"
                        >
                          {contributor.user_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {event.location && (
            <div>
              <a
                className="flex gap-1 items-center"
                target="_blank"
                href={`/map?place=${event.location.id}`}
                rel="noreferrer"
              >
                <MapPinCheck className="text-black" />
                <p className="text-black">{event.location.formatted_address}</p>
              </a>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
