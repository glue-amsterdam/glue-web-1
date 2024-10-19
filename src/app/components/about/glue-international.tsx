"use client";

import { Button } from "@/components/ui/button";
import { GlueInternationalContent } from "@/utils/about-types";
import { GiWorld } from "react-icons/gi";
import Image from "next/image";
import { motion } from "framer-motion";

interface GlueInternationalProps {
  glueInternational: GlueInternationalContent;
}

export default function GlueInternational({
  glueInternational,
}: GlueInternationalProps) {
  return (
    <div className="relative mt-6 max-h-[80%] mx-auto">
      <motion.div
        initial={{ x: 80, y: 20 }}
        whileInView={{ x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 w-[90%] mx-auto bg-[#D36427] rounded-lg"
      />
      <motion.div
        initial={{ x: -120, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="group bg-uiblack w-[80%] relative min-h-[30vh] flex flex-wrap rounded-lg shadow-md mx-auto overflow-hidden p-5"
      >
        <div className="text-uiwhite flex-1 pl-5">
          <Image
            src={"/logos/logo-main.png"}
            className=""
            alt="GLUE logo, connected by design"
            width={150}
            height={100}
          />
          <h2 id="glue-international-heading" className="text-3xl font-bold">
            {glueInternational.title}
          </h2>
          <p>{glueInternational.subtitle}</p>
        </div>
        <Button
          asChild
          className="flex-1 md:py-6 text-lg bg-[#D36427] scale-90 hover:scale-100 transition duration-500"
        >
          <a
            href={glueInternational.website}
            target="_blank"
            className="text-uiwhite flex gap-2 h-auto"
            rel="noopener noreferrer"
          >
            <GiWorld className="" size={50} />
            <span className="text-sm lg:text-lg font-bold">
              {glueInternational.buttonText}
            </span>
          </a>
        </Button>
      </motion.div>
    </div>
  );
}
