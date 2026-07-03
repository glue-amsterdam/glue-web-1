import { cn } from "@/lib/utils";
import { ClientCitizen } from "@/schemas/citizenSchema";
import PreloadedImageStack from "@/components/preloaded-image-stack";

type Props = {
  citizens: ClientCitizen[];
  currentIndex: number;
  onAdvance?: () => void;
  className?: string;
  archiveYear?: number;
  align?: "center" | "start";
};

const IMAGE_SIZES = "(max-width: 768px) 244px, (max-width: 1024px) 364px, 508px";

const IMAGE_CLASSNAME =
  "mx-auto h-[339px] w-[244px] md:h-[508px] md:w-[364px] lg:h-[728px] lg:w-[508px]";

const buildAlt = (citizen: ClientCitizen, archiveYear?: number) =>
  archiveYear != null
    ? `${citizen.name}, Creative Citizen of Honour ${archiveYear}`
    : citizen.name;

const CreativeCitizensImage = ({
  citizens,
  currentIndex,
  onAdvance,
  className,
  archiveYear,
  align = "center",
}: Props) => {
  const slides = citizens.map((citizen) => ({
    id: citizen.id,
    src: citizen.image_url,
    alt: buildAlt(citizen, archiveYear),
  }));

  return (
    <div
      data-citizen-image
      className={cn(
        "flex",
        align === "start" ? "justify-start" : "justify-center",
        className
      )}
    >
      <PreloadedImageStack
        slides={slides}
        currentIndex={currentIndex}
        onAdvance={onAdvance}
        className={IMAGE_CLASSNAME}
        sizes={IMAGE_SIZES}
        align={align}
      />
    </div>
  );
};

export default CreativeCitizensImage;
