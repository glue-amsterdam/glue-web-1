import Image from "next/image";
import { cn } from "@/lib/utils";

export const ABOUT_BLOCK_IMAGE_MAX_WIDTH = 1045;
export const ABOUT_BLOCK_IMAGE_MAX_HEIGHT = 674;

type Props = {
  src: string;
  alt: string;
  fallbackAlt?: string;
  className?: string;
};

const AboutBlockImage = ({ src, alt, fallbackAlt, className }: Props) => {
  const imageAlt = alt.trim() || fallbackAlt?.trim() || "GLUE about section image";

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[1045px] aspect-1045/674 max-h-[339px] lg:max-h-[674px]",
        className
      )}
    >
      <Image
        width={ABOUT_BLOCK_IMAGE_MAX_WIDTH}
        height={ABOUT_BLOCK_IMAGE_MAX_HEIGHT}
        src={src}
        alt={imageAlt}
        sizes={`(min-width: 1024px) ${ABOUT_BLOCK_IMAGE_MAX_WIDTH}px, 100vw`}
        className="absolute inset-0 h-full w-full object-cover lg:object-contain lg:object-top object-center"
      />
    </div>
  );
};

export default AboutBlockImage;
