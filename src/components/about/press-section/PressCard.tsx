import { PressItem } from "@/schemas/pressSchema";
import Image from "next/image";

interface InfoCardProps {
  press: PressItem;
}

const PressCard = ({ press }: InfoCardProps) => {
  return (
    <div className="relative flex-1 w-full h-full">
      <Image
        src={press.image_url || "/placeholder.jpg"}
        alt={`${press.title} - Information about GLUE routes desing`}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 80vw"
        className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
        quality={70}
      />

      <h3 className="tracking-wider min-h-[20%] max-h-[50%] font-overpass text-uiwhite text-2xl md:text-4xl lg:text-3xl absolute top-0 bg-black/25 w-full flex items-center px-4">
        {press.title}
      </h3>
    </div>
  );
};

export default PressCard;
