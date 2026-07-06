import Image from "next/image";

const IMAGE_WIDTH = 450;
const IMAGE_HEIGHT = 242;

type ProgramImageProps = {
  src: string;
  alt: string;
};

const ProgramImage = ({ src, alt }: ProgramImageProps) => {
  return (
    <div className="flex w-full h-[165px] lg:h-[200px] overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="h-full w-full object-contain object-center"
      />
    </div>
  );
};

export default ProgramImage;
