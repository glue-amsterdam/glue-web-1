import Image from "next/image";

const PROFILE_MAX_WIDTH = 1045;
const PROFILE_MAX_HEIGHT = 674;

type Props = {
    src: string;
    alt: string;
};

const ProgramFullImage = ({ src, alt }: Props) => {
    return (
        <div
            data-exhibitor-profile-image
            className="relative mx-auto w-full max-w-[1045px] aspect-1045/674 lg:max-h-[674px] max-h-[339px]"
        >
            <Image
                width={PROFILE_MAX_WIDTH}
                height={PROFILE_MAX_HEIGHT}
                src={src}
                alt={alt}
                sizes={`(min-width: 1024px) ${PROFILE_MAX_WIDTH}px, 100vw`}
                className="absolute inset-0 h-full w-full object-contain object-top"
            />
        </div>
    );
};

export default ProgramFullImage;