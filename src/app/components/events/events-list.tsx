"use client";
import { IndividualEventResponse } from "@/schemas/eventSchemas";
import EventCard from "./event-card";
import { memo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const EventsList = memo(function EventsList({
  events,
}: {
  events: IndividualEventResponse[];
}) {
  useGSAP(() => {
    gsap.fromTo(
      ["#event-card"],
      {
        opacity: 0,
        x: 100,
        filter: "blur(10px)",
        duration: 0.5,
        ease: "power2.inOut",
      },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.5,
        x: 0,
        ease: "power2.inOut",
        stagger: 0.2,
      }
    );
  });

  if (events.length === 0) {
    return <div>No events found</div>;
  }

  return (
    <ul className="grid grid-cols-1 gap-6">
      {events.map((event, index) => (
        <li id="event-card" key={event.eventId}>
          <EventCard i={index} event={event} />
        </li>
      ))}
    </ul>
  );
});

export default EventsList;
