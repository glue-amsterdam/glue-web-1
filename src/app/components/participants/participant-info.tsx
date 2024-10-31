"use client";

import { ParticipantUser } from "@/utils/user-types";
import { motion, Variants } from "framer-motion";
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

export default function ParticipantInfo({
  participant,
}: {
  participant: ParticipantUser;
}) {
  return (
    <motion.div
      className="h-full overflow-y-auto p-4 md:p-6 space-y-8 bg-gradient-to-br from-gray-50 to-white"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight"
        variants={fadeInUp}
      >
        {participant.userName}
      </motion.h1>
      <motion.p
        className="text-sm md:text-base text-uiblack/80 leading-relaxed"
        variants={fadeInUp}
      >
        {participant.shortDescription}
      </motion.p>
      {participant.description && (
        <motion.p
          className="text-sm md:text-base text-uiblack/80 leading-relaxed"
          variants={fadeInUp}
        >
          {participant.description}
        </motion.p>
      )}
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700 flex items-center">
          <FaClock className="mr-2" /> Visiting Hours
        </h2>
        {participant.visitingHours && participant.visitingHours.length > 0 ? (
          participant.visitingHours.map((dayRange) => (
            <div key={dayRange.id} className="mb-2">
              <p className="text-sm md:text-base text-uiblack/80">
                <span className="font-medium">{dayRange.label}:</span>{" "}
                {dayRange.ranges.map((range, index) => (
                  <span key={index} className="ml-2">
                    {range.open} - {range.close}
                    {index < dayRange.ranges.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm md:text-base text-uiblack/80">
            Hours not provided
          </p>
        )}
      </motion.div>
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-700">
          Address
        </h2>
        <p className="text-sm md:text-base text-uiblack/80 whitespace-pre-wrap">
          {participant.mapInfo.place_name || "No address provided"}
        </p>
      </motion.div>
      <motion.div className="space-y-3" variants={fadeInUp}>
        {participant.phoneNumber && participant.phoneNumber.length > 0 && (
          <div className="flex items-center gap-2">
            <FaPhone className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiblack" />
            {participant.phoneNumber.map((phone, index) => (
              <motion.div
                key={index}
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <a
                  href={`tel:${phone}`}
                  className="text-sm md:text-base text-uiblack/80 hover:text-uiblack transition-colors"
                >
                  {phone}
                </a>
                {index < participant.phoneNumber!.length - 1 && ", "}
              </motion.div>
            ))}
          </div>
        )}
        {participant.visibleEmail && participant.visibleEmail.length > 0 && (
          <div className="flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiblack" />
            {participant.visibleEmail.map((email, index) => (
              <motion.a
                key={email + index}
                href={`mailto:${email}`}
                className="text-sm md:text-base text-uiblack/80 hover:text-uiblack transition-colors"
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
              <FaGlobe className="w-4 h-4 md:w-5 md:h-5 mr-3 text-uiblack" />
              {participant.visibleWebsite.map((website, index) => (
                <motion.div
                  key={index}
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base text-uiblack/80 hover:text-uiblack transition-colors"
                  >
                    {website}
                  </a>
                  {index < participant.visibleWebsite!.length - 1 && ", "}
                </motion.div>
              ))}
            </div>
          )}
      </motion.div>
      {participant.socialMedia && (
        <motion.div className="flex space-x-6" variants={fadeInUp}>
          {participant.socialMedia.instagram?.map((link, index) => (
            <motion.a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaInstagram className="w-6 h-6 md:w-7 md:h-7 text-pink-500" />
            </motion.a>
          ))}
          {participant.socialMedia.facebook?.map((link, index) => (
            <motion.a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaFacebookF className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
            </motion.a>
          ))}
          {participant.socialMedia.linkedin?.map((link, index) => (
            <motion.a
              key={index}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaLinkedinIn className="w-6 h-6 md:w-7 md:h-7 text-blue-700" />
            </motion.a>
          ))}
        </motion.div>
      )}
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <FaInfoCircle className="w-4 h-4" />
        <span>
          Join GLUE: {new Date(participant.createdAt).toLocaleDateString()}
        </span>
      </motion.div>
    </motion.div>
  );
}
