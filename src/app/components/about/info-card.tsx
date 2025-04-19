import { Card } from "@/components/ui/card";
import { InfoItemClient } from "@/schemas/infoSchema";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

interface InfoCardProps {
  info: InfoItemClient;
  i: number;
  setSelectedInfo: React.Dispatch<React.SetStateAction<InfoItemClient | null>>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InfoCard = ({
  info,
  i,
  setSelectedInfo,
  setModalOpen,
}: InfoCardProps) => {
  const openModal = (info: InfoItemClient) => {
    setSelectedInfo(info);
    setModalOpen(true);
  };

  const hasAnimatedRef = useRef(false);
  const yOffset = i % 2 === 1 ? -150 : 150;

  return (
    <motion.div
      initial={{
        y: hasAnimatedRef.current ? 0 : yOffset,
        opacity: hasAnimatedRef.current ? 1 : 0,
      }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: i * 0.2 }}
      viewport={{ once: true }}
      className="relative shadow-md overflow-hidden h-full"
      onViewportEnter={() => (hasAnimatedRef.current = true)}
    >
      <Card
        className="cursor-pointer rounded-none border-none group shadow-md h-full"
        onClick={() => openModal(info)}
      >
        <div className="relative w-full h-full">
          <Image
            src={info.image_url || "/placeholder.jpg"}
            alt={`${info.title} - Information about GLUE routes desing`}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover w-full h-full group-hover:scale-105 transition-all duration-700"
            quality={70}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-uiblack/50 w-full text-uiwhite py-4 duration-300 group-hover:py-12 transition-all">
            <h3 className="font-bold text-xl lg:text-3xl tracking-wider mb-2 text-center">
              {info.title}
            </h3>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default InfoCard;
