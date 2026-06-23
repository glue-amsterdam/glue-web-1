import Image from "next/image";

import { cn } from "@/lib/utils";
import { ClientCitizen } from "@/schemas/citizenSchema";

type Props = {
  citizen: ClientCitizen;
  className?: string;
  archiveYear?: number;
};

const CreativeCitizensImage = ({
  citizen,
  className,
  archiveYear,
}: Props) => {
  const alt =
    archiveYear != null
      ? `${citizen.name}, Creative Citizen of Honour ${archiveYear}`
      : citizen.name;

  return (
    <div
      data-citizen-image
      className={cn(
        className,
        "relative mx-auto h-[339px] w-[244px] md:h-[508px] md:w-[364px] lg:h-[728px] lg:w-[508px]"
      )}
    >
      <Image
        src={citizen.image_url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 244px, (max-width: 1024px) 364px, 508px"
        className="object-cover"
      />
    </div>
  );
};

export default CreativeCitizensImage;
