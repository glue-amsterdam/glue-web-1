"use client";

import { ParticipantHubInfo } from "@/app/components/participants/participant-hub-info";
import { useEventsDays } from "@/app/context/MainContext";
import { ParticipantClientResponse } from "@/types/api-visible-user";
import { formatUrl } from "@/utils/formatUrl";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const stagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface ParticipantInfoProps {
  participant: ParticipantClientResponse;
}

function ParticipantInfo({ participant }: ParticipantInfoProps) {
  const eventDays = useEventsDays();
  const visitingHours = participant.user_info.visiting_hours?.[0]?.hours;

  const getDayLabel = (dayId: string) => {
    const day = eventDays.find((day) => day.dayId === dayId);
    return day ? day.label : dayId;
  };
  return (
    <motion.div
      className="h-full text-white overflow-y-auto p-4"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <div className="mx-auto font-overpass">
        <motion.h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          variants={fadeInUp}
        >
          {participant.user_info.user_name}
        </motion.h1>

        {participant.short_description && (
          <motion.p
            className="text-sm md:text-base leading-relaxed mt-4"
            variants={fadeInUp}
          >
            {participant.short_description}
          </motion.p>
        )}
        {participant.description && (
          <>
            <motion.div
              style={{
                color: "white",
              }}
              className="text-sm md:text-base leading-relaxed mt-4 prose prose-sm md:prose-base max-w-none text-white dark:text-white"
              variants={fadeInUp}
              dangerouslySetInnerHTML={{ __html: participant.description }}
            />
          </>
        )}

        <motion.div variants={fadeInUp} className="mt-8">
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
        </motion.div>

        <motion.div className="space-y-3 mt-8" variants={fadeInUp}>
          {participant.user_info.phone_numbers &&
            participant.user_info.phone_numbers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {participant.user_info.phone_numbers.map((phone, index) => (
                  <motion.a
                    key={index}
                    href={`tel:${phone}`}
                    className="text-sm md:text-base hover:text-uiwhite transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {phone}
                    {index < participant.user_info.phone_numbers!.length - 1 &&
                      ", "}
                  </motion.a>
                ))}
              </div>
            )}
          {participant.user_info.visible_emails &&
            participant.user_info.visible_emails.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {participant.user_info.visible_emails.map((email, index) => (
                  <motion.a
                    key={email + index}
                    href={`mailto:${email}`}
                    className="text-sm md:text-base hover:text-uiwhite transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {email}
                    {index < participant.user_info.visible_emails!.length - 1 &&
                      ", "}
                  </motion.a>
                ))}
              </div>
            )}
          {participant.user_info.visible_websites &&
            participant.user_info.visible_websites.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                {participant.user_info.visible_websites.map(
                  (website, index) => (
                    <motion.a
                      key={index}
                      href={formatUrl(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm md:text-base hover:text-uiwhite transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {website}
                      {index <
                        participant.user_info.visible_websites!.length - 1 &&
                        ", "}
                    </motion.a>
                  )
                )}
              </div>
            )}
        </motion.div>
        {participant.user_info.social_media && (
          <motion.div className="flex space-x-6 mt-8" variants={fadeInUp}>
            {participant.user_info.social_media.instagramLink && (
              <motion.a
                href={formatUrl(
                  participant.user_info.social_media.instagramLink
                )}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </motion.a>
            )}
            {participant.user_info.social_media.facebookLink && (
              <motion.a
                href={formatUrl(
                  participant.user_info.social_media.facebookLink
                )}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebookF className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </motion.a>
            )}
            {participant.user_info.social_media.linkedinLink && (
              <motion.a
                href={formatUrl(
                  participant.user_info.social_media.linkedinLink
                )}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaLinkedinIn className="w-6 h-6 md:w-7 md:h-7 text-blue-700" />
              </motion.a>
            )}
          </motion.div>
        )}
        {participant.user_info.visiting_hours &&
          participant.user_info.visiting_hours.length > 0 && (
            <motion.div className="mt-8" variants={fadeInUp}>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">
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
            </motion.div>
          )}
        {participant.user_info.events &&
          participant.user_info.events.length > 0 && (
            <motion.div className="mt-8 pb-2" variants={fadeInUp}>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">
                Events
              </h2>
              <div className="flex flex-wrap items-center gap-4 py-4 overflow-x-hidden">
                {participant.user_info.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events?eventId=${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-24 w-full lg:w-48 relative aspect-video hover:scale-105 transition-all"
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
            </motion.div>
          )}
      </div>
    </motion.div>
  );
}

export default ParticipantInfo;
