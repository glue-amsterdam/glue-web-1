"use client";

import { ParticipantClientResponse } from "@/types/api-visible-user";
import { formatUrl } from "@/utils/formatUrl";
import { motion, Variants } from "framer-motion";
import { MapPinOff } from "lucide-react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaGlobe,
} from "react-icons/fa";

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
  console.log(
    formatUrl(participant.user_info.social_media.instagramLink || "")
  );

  return (
    <motion.div
      className="h-full p-4 md:p-6 text-white"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <div className="max-w-3xl mx-auto font-overpass">
        <motion.h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          variants={fadeInUp}
        >
          {participant.user_info.user_name}
        </motion.h1>
        <motion.p
          className="text-sm md:text-base leading-relaxed mt-4"
          variants={fadeInUp}
        >
          {participant.short_description}
        </motion.p>
        {participant.description && (
          <motion.div
            className="text-sm md:text-base leading-relaxed mt-4"
            variants={fadeInUp}
            dangerouslySetInnerHTML={{ __html: participant.description }}
          />
        )}
        <motion.div variants={fadeInUp} className="mt-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">
            Address
          </h2>
          {participant.user_info.map_info.length === 0 ? (
            <div className="inline-flex gap-2 items-center text-gray-500">
              <MapPinOff className="w-5 h-5" />
              <span>No address provided</span>
            </div>
          ) : (
            participant.user_info.map_info.map((map, index) => (
              <div key={index} className="flex items-center gap-2">
                <MapPinOff className="w-5 h-5" />
                <Link target="_blank" href={`/map?place=${map.id}`}>
                  <span>{map.formatted_address}</span>
                </Link>
              </div>
            ))
          )}
        </motion.div>
        <motion.div className="space-y-3 mt-8" variants={fadeInUp}>
          {participant.user_info.phone_numbers &&
            participant.user_info.phone_numbers.length > 0 && (
              <div className="flex items-center gap-2">
                <FaPhone className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiwhite" />
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
              <div className="flex items-center gap-2">
                <FaEnvelope className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiwhite" />
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
              <div className="flex items-center gap-2">
                <FaGlobe className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiwhite" />
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
      </div>
    </motion.div>
  );
}

export default ParticipantInfo;
