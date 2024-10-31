"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IndividualEventResponse } from "@/utils/event-types";
import { fadeInConfig } from "@/utils/animations";
import Link from "next/link";

interface EventCardProps {
  event: IndividualEventResponse;
  i: number;
}

export default function EventCard({ event, i }: EventCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClick = (clickedEventId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("eventId", clickedEventId);
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <motion.div {...fadeInConfig}>
      <motion.article
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: i / 6 }}
        className="relative min-h-[20vh] overflow-hidden group"
      >
        <div
          className="cursor-pointer hover:shadow-lg transition-shadow h-full"
          onClick={() => handleClick(event.eventId)}
        >
          <div className="bg-background opacity-50 group-hover:bg-foreground group-hover:opacity-100 transition-all duration-200 absolute inset-0 z-10" />
          <img
            src={event.thumbnail.imageUrl}
            alt={event.name}
            className="absolute rounded-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover w-full h-full"
          />
          <motion.div className="absolute inset-0 flex flex-col justify-center px-2 md:px-10 z-20 group-hover:text-background transition-all duration-200">
            <h3 className="text-xl md:text-4xl tracking-widest">
              {event.name}
            </h3>

            <time
              className="text-sm text-muted-foreground mb-2 block"
              dateTime={`${event.date.date}T${event.startTime}`}
            >
              {new Date(event.date.date).toLocaleDateString("en-GB", {
                timeZone: "UTC",
              })}
              | {event.startTime} - {event.endTime}
            </time>
            <div>
              <div className="flex gap-2 items-center">
                <span className="text-sm md:text-lg font-bold">Organizer:</span>
                {event.organizer.slug ? (
                  <Link
                    href={`/participants/${event.organizer.slug}`}
                    className="text-xs md:text-sm hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {event.organizer.userName}
                  </Link>
                ) : (
                  <p className="text-xs md:text-sm">
                    {event.organizer.userName}
                  </p>
                )}
              </div>
              {event.coOrganizers.length > 0 && (
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-sm md:text-lg font-bold">
                    Co organizers:
                  </span>
                  {event.coOrganizers.map((contributor) => (
                    <p className="text-xs md:text-sm" key={contributor.userId}>
                      {contributor.slug ? (
                        <Link
                          href={`/participants/${contributor.slug}`}
                          className="hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contributor.userName}
                        </Link>
                      ) : (
                        <span>{contributor.userName}</span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.article>
    </motion.div>
  );
}
