"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Contributor, Event } from "@/utils/event-types";
interface EventCardProps {
  event: Event;
  i: number;
}

export default function EventCard({ event, i }: EventCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/events?eventId=${event.id}`, { scroll: false });
  };

  return (
    <motion.article
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: i / 6 }}
      className="relative min-h-[20vh] overflow-hidden group"
    >
      <div
        className="cursor-pointer hover:shadow-lg transition-shadow h-full"
        onClick={handleClick}
      >
        <div className="bg-uiblack opacity-50 group-hover:bg-uiwhite group-hover:opacity-100 transition-all duration-200 absolute inset-0 z-10" />
        <img
          src={event.thumbnail}
          alt={event.name}
          className="absolute rounded-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-10 z-20 group-hover:text-uiblack transition-all duration-200">
          <h3 className="text-4xl tracking-widest ">{event.name}</h3>
          <time
            className="text-sm text-gray-500 mb-2 block"
            dateTime={`${event.date}T${event.startTime}`}
          >
            {new Date(event.date).toLocaleDateString("en-GB", {
              timeZone: "UTC",
            })}{" "}
            | {event.startTime} - {event.endTime}
          </time>
          <div>
            <div className="flex gap-2 items-center">
              <span className="text-lg font-bold">Creator:</span>{" "}
              <p>{event.creator.name}</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg font-bold">Contributors:</span>{" "}
              {event.contributors.map((contributor: Contributor) => (
                <p key={contributor.name}>
                  <span>{contributor.name}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
