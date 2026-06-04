import type { ExhibitorCarouselSlide } from "@/lib/participants/exhibitor-carousel-slides";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PROFILE_MAX_WIDTH = 1045;
const PROFILE_MAX_HEIGHT = 674;

type Props = {
    slide: ExhibitorCarouselSlide;
    className?: string;
};

const ExhibitorProfileImage = ({ slide, className }: Props) => {
    return (
        <div
            data-exhibitor-profile-image
            className={cn(
                className,
                "relative mx-auto w-full max-w-[1045px] aspect-1045/674 lg:max-h-[674px] max-h-[339px]"
            )}
        >
            <Image
                width={PROFILE_MAX_WIDTH}
                height={PROFILE_MAX_HEIGHT}
                src={slide.imageUrl}
                alt={slide.label}
                sizes={`(min-width: 1024px) ${PROFILE_MAX_WIDTH}px, 100vw`}
                className="absolute inset-0 h-full w-full object-contain object-top"
            />
        </div>
    );
};

export default ExhibitorProfileImage;
