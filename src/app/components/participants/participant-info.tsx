"use client";

import { motion, Variants } from "framer-motion";
import { MapPinCheck, MapPinOff } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaInfoCircle,
  FaClock,
} from "react-icons/fa";
import { ParticipantUser } from "@/schemas/usersSchemas";
import { MapLocationEnhaced } from "@/schemas/mapSchema";

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
  participant: ParticipantUser;
  mapData: MapLocationEnhaced | null;
}

function ParticipantInfo({ participant, mapData }: ParticipantInfoProps) {
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
          {participant.userName}
        </motion.h1>
        <motion.p
          className="text-sm md:text-base leading-relaxed mt-4"
          variants={fadeInUp}
        >
          {participant.shortDescription}
        </motion.p>
        {participant.description && (
          <motion.p
            className="text-sm md:text-base leading-relaxed mt-4"
            variants={fadeInUp}
          >
            {participant.description}
          </motion.p>
        )}
        <motion.div variants={fadeInUp} className="mt-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700 flex items-center">
            <FaClock className="mr-2" /> Visiting Hours
          </h2>
          {participant.visitingHours && participant.visitingHours.length > 0 ? (
            participant.visitingHours.map((dayRange) => (
              <div key={dayRange.dayId} className="mb-2">
                <p className="text-sm md:text-base">
                  <span className="font-medium">{dayRange.label}:</span>{" "}
                  {dayRange.ranges &&
                    dayRange.ranges.map((range, index) => (
                      <span key={index} className="ml-2">
                        {range.open} - {range.close}
                        {index < (dayRange.ranges?.length || 0) - 1 ? ", " : ""}
                      </span>
                    ))}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm md:text-base">Hours not provided</p>
          )}
        </motion.div>
        <motion.div variants={fadeInUp} className="mt-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">
            Address
          </h2>
          {mapData ? (
            <div>
              <a
                className="flex gap-1"
                target="_blank"
                href={`/map/${mapData.mapbox_id}`}
              >
                <MapPinCheck />
                <p>{mapData.place_name}</p>
              </a>
            </div>
          ) : participant.noAddress ? (
            <div className="inline-flex gap-2 items-center text-gray-500">
              <MapPinOff className="w-5 h-5" />
              <span>No address provided</span>
            </div>
          ) : (
            <span className="text-gray-500">
              Address information unavailable
            </span>
          )}
        </motion.div>
        <motion.div className="space-y-3 mt-8" variants={fadeInUp}>
          {participant.phoneNumber && participant.phoneNumber.length > 0 && (
            <div className="flex items-center gap-2">
              <FaPhone className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiwhite" />
              {participant.phoneNumber.map((phone, index) => (
                <motion.a
                  key={index}
                  href={`tel:${phone}`}
                  className="text-sm md:text-base hover:text-uiwhite transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {phone}
                  {index < participant.phoneNumber!.length - 1 && ", "}
                </motion.a>
              ))}
            </div>
          )}
          {participant.visibleEmail && participant.visibleEmail.length > 0 && (
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiwhite" />
              {participant.visibleEmail.map((email, index) => (
                <motion.a
                  key={email + index}
                  href={`mailto:${email}`}
                  className="text-sm md:text-base hover:text-uiwhite transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {email}
                  {index < participant.visibleEmail!.length - 1 && ", "}
                </motion.a>
              ))}
            </div>
          )}
          {participant.visibleWebsite &&
            participant.visibleWebsite.length > 0 && (
              <div className="flex items-center gap-2">
                <FaGlobe className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiwhite" />
                {participant.visibleWebsite.map((website, index) => (
                  <motion.a
                    key={index}
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base hover:text-uiwhite transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {website}
                    {index < participant.visibleWebsite!.length - 1 && ", "}
                  </motion.a>
                ))}
              </div>
            )}
        </motion.div>
        {participant.socialMedia && (
          <motion.div className="flex space-x-6 mt-8" variants={fadeInUp}>
            {participant.socialMedia.instagramLink && (
              <motion.a
                href={participant.socialMedia.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaInstagram className="w-6 h-6 md:w-7 md:h-7 text-pink-500" />
              </motion.a>
            )}
            {participant.socialMedia.facebookLink && (
              <motion.a
                href={participant.socialMedia.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaFacebookF className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              </motion.a>
            )}
            {participant.socialMedia.linkedinLink && (
              <motion.a
                href={participant.socialMedia.linkedinLink}
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
        <motion.div
          variants={fadeInUp}
          className="flex items-center gap-2 text-sm text-gray-500 mt-8"
        >
          <FaInfoCircle className="w-4 h-4" />
          <span>
            Join GLUE: {new Date(participant.createdAt).toLocaleDateString()}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ParticipantInfo;
