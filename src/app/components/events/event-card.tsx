"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import { getEventIcon } from "@/constants";

interface EventCardProps {
  event: IndividualEventResponse;
  i: number;
}

export default function EventCard({ event }: EventCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleClick = (clickedEventId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("eventId", clickedEventId);
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const EventIcon = getEventIcon(event.type);

  return (
    <motion.div {...fadeInConfig}>
      <motion.article
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative min-h-[20vh] overflow-hidden group "
      >
        <div
          className="cursor-pointer hover:shadow-lg transition-shadow h-full"
          onClick={() => handleClick(event.eventId)}
        >
          <div className="bg-black/20 group-hover:bg-background/80 transition-all duration-200 absolute inset-0 z-10" />
          <img
            src={event.thumbnail.image_url}
            alt={`Event from the GLUE community: ${event.name} - ${event.type} type`}
            className="absolute rounded-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-2 md:px-10 z-20 group-hover:text-black text-background transition-all duration-200">
            <h3 className="text-xl md:text-2xl xl:text-4xl tracking-widest">
              <div className="flex items-center gap-2">
                <span>
                  <EventIcon className="size-3 md:size-4 lg:size-6" />
                </span>
                <p className="text-xs md:text-sm lg:text-base">{event.type}</p>
              </div>
              {event.name}
            </h3>

            <time
              className="text-sm text-muted-foreground mb-2 block"
              dateTime={`${event.date.date ?? ""}T${event.startTime}`}
            >
              {event.date.date
                ? new Date(event.date.date).toLocaleDateString("en-GB", {
                    timeZone: "UTC",
                  })
                : "Invalid date"}
              | {event.startTime} - {event.endTime}
            </time>
            <div>
              <div className="flex gap-2 items-center">
                <span className="text-sm md:text-lg font-bold">Organiser:</span>

                {event.organizer.user_name}
              </div>
              {event.coOrganizers && (
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-sm md:text-lg font-bold">
                    Co-organisers:
                  </span>
                  {event.coOrganizers.map((contributor) => (
                    <p className="text-xs md:text-sm" key={contributor.user_id}>
                      <span>{contributor.user_name}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
