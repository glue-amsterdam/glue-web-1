"use client";

import { useEventsDays } from "@/app/context/MainContext";
import { ParticipantClientResponse } from "@/types/api-visible-user";
import { formatUrl } from "@/utils/formatUrl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { ParticipantHubInfo } from "./ParticipantHUBinfo";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ParticipantInfoProps {
  participant: ParticipantClientResponse;
}

function ParticipantInfo({ participant }: ParticipantInfoProps) {
  const eventDays = useEventsDays();
  const visitingHours = participant.user_info.visiting_hours?.[0]?.hours;
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const getDayLabel = (dayId: string) => {
    const day = eventDays.find((day) => day.dayId === dayId);
    return day ? day.label : dayId;
  };

  useGSAP(
    () => {
      // Initial entrance animation
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Animate title
      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      );

      // Animate description sections
      if (
        participant.short_description &&
        descriptionRef.current?.querySelector("p")
      ) {
        tl.fromTo(
          descriptionRef.current.querySelector("p"),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4"
        );
      }

      if (
        participant.description &&
        descriptionRef.current?.querySelector("div")
      ) {
        tl.fromTo(
          descriptionRef.current.querySelector("div"),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.3"
        );
      }

      // Animate address section
      if (participant.user_info.map_info.length > 0) {
        tl.fromTo(
          addressRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.2"
        );
      }

      // Animate contact information
      tl.fromTo(
        contactRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.2"
      );

      // Animate social media icons
      if (participant.user_info.social_media) {
        tl.fromTo(
          socialRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.2"
        );

        // Stagger social media icons
        const socialIcons = socialRef.current?.querySelectorAll("a");
        if (socialIcons) {
          gsap.fromTo(
            socialIcons,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              stagger: 0.1,
              ease: "back.out(1.7)",
              delay: 0.5,
            }
          );
        }
      }

      // Animate visiting hours
      if (participant.user_info.visiting_hours?.length > 0) {
        tl.fromTo(
          hoursRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.2"
        );
      }

      // Animate events section
      if (participant.user_info.events?.length > 0) {
        tl.fromTo(
          eventsRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.2"
        );

        // Stagger event cards
        const eventCards = eventsRef.current?.querySelectorAll("a");
        if (eventCards) {
          gsap.fromTo(
            eventCards,
            { y: 50, opacity: 0, scale: 0.8 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
              delay: 0.8,
            }
          );
        }
      }

      // Add hover animations for interactive elements
      const links = containerRef.current?.querySelectorAll("a");
      if (links) {
        links.forEach((link) => {
          link.addEventListener("mouseenter", () => {
            gsap.to(link, { scale: 1.05, duration: 0.2, ease: "power2.out" });
          });

          link.addEventListener("mouseleave", () => {
            gsap.to(link, { scale: 1, duration: 0.2, ease: "power2.out" });
          });
        });
      }

      // Add scroll-triggered animations
      ScrollTrigger.batch(".animate-on-scroll", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
          );
        },
        start: "top 80%",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-full text-white overflow-y-auto p-4"
    >
      <div className="mx-auto font-overpass">
        <h1
          ref={titleRef}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          {participant.user_info.user_name}
        </h1>

        <div ref={descriptionRef}>
          {participant.short_description && (
            <p className="text-sm md:text-base leading-relaxed mt-4">
              {participant.short_description}
            </p>
          )}
          {participant.description && (
            <>
              <div
                style={{
                  color: "white",
                }}
                className="text-sm md:text-base leading-relaxed mt-4 prose prose-sm md:prose-base max-w-none text-white dark:text-white"
                dangerouslySetInnerHTML={{ __html: participant.description }}
              />
            </>
          )}
        </div>

        <div ref={addressRef} className="mt-8">
          {participant.user_info.map_info.length > 0 && (
            <>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                Address
              </h2>
              {participant.user_info.map_info.map((map, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Link target="_blank" href={`/map?place=${map.id}`}>
                    <span>{map.formatted_address}</span>
                  </Link>
                </div>
              ))}
            </>
          )}
          <ParticipantHubInfo userId={participant.user_id} />
        </div>

        <div ref={contactRef} className="space-y-3 mt-8">
          {participant.user_info.phone_numbers &&
            participant.user_info.phone_numbers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {participant.user_info.phone_numbers.map((phone, index) => (
                  <a
                    key={index}
                    href={`tel:${phone}`}
                    className="text-sm md:text-base hover:text-uiwhite transition-colors"
                  >
                    {phone}
                    {index < participant.user_info.phone_numbers!.length - 1 &&
                      ", "}
                  </a>
                ))}
              </div>
            )}
          {participant.user_info.visible_emails &&
            participant.user_info.visible_emails.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {participant.user_info.visible_emails.map((email, index) => (
                  <a
                    key={email + index}
                    href={`mailto:${email}`}
                    className="text-sm md:text-base hover:text-uiwhite transition-colors"
                  >
                    {email}
                    {index < participant.user_info.visible_emails!.length - 1 &&
                      ", "}
                  </a>
                ))}
              </div>
            )}
          {participant.user_info.visible_websites &&
            participant.user_info.visible_websites.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                {participant.user_info.visible_websites.map(
                  (website, index) => (
                    <a
                      key={index}
                      href={formatUrl(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm md:text-base hover:text-uiwhite transition-colors"
                    >
                      {website}
                      {index <
                        participant.user_info.visible_websites!.length - 1 &&
                        ", "}
                    </a>
                  )
                )}
              </div>
            )}
        </div>

        {participant.user_info.social_media && (
          <div ref={socialRef} className="flex space-x-6 mt-8">
            {participant.user_info.social_media.instagramLink && (
              <a
                href={formatUrl(
                  participant.user_info.social_media.instagramLink
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-200 hover:scale-110"
              >
                <FaInstagram className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </a>
            )}
            {participant.user_info.social_media.facebookLink && (
              <a
                href={formatUrl(
                  participant.user_info.social_media.facebookLink
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-200 hover:scale-110"
              >
                <FaFacebookF className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </a>
            )}
            {participant.user_info.social_media.linkedinLink && (
              <a
                href={formatUrl(
                  participant.user_info.social_media.linkedinLink
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform duration-200 hover:scale-110"
              >
                <FaLinkedinIn className="w-6 h-6 md:w-7 md:h-7 text-blue-700" />
              </a>
            )}
          </div>
        )}

        {participant.user_info.visiting_hours &&
          participant.user_info.visiting_hours.length > 0 && (
            <div ref={hoursRef} className="mt-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-3 ">
                Visiting Hours
              </h2>
              {visitingHours && Object.keys(visitingHours).length > 0 ? (
                <div className="mb-4">
                  {Object.entries(visitingHours).map(([dayId, times]) =>
                    times.length > 0 ? (
                      <div key={dayId} className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {getDayLabel(dayId)}:
                        </span>
                        {times.map((time, timeIndex) => (
                          <span key={timeIndex}>
                            {time.open} - {time.close}
                            {timeIndex < times.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <p>No visiting hours available.</p>
              )}
            </div>
          )}

        {participant.user_info.events &&
          participant.user_info.events.length > 0 && (
            <div ref={eventsRef} className="mt-8 pb-16">
              <h2 className="text-xl md:text-2xl font-semibold mb-3 ">
                Events
              </h2>
              <div className="flex flex-wrap items-center gap-4 py-4 overflow-x-hidden">
                {participant.user_info.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events?eventId=${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-24 w-full lg:w-48 relative aspect-video hover:scale-105 transition-all duration-300 ease-out"
                  >
                    <Image
                      src={event.image_url || "/placeholder.jpg"}
                      alt={event.title + "- Event from GLUE"}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <h3 className="text-white text-center text-xs font-semibold p-2">
                        {event.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

export default ParticipantInfo;
