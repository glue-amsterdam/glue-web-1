import Image from "next/image";

const IMAGE_WIDTH = 450;
const IMAGE_HEIGHT = 242;

type ProgramImageProps = {
  src: string;
  alt: string;
};

const ProgramImage = ({ src, alt }: ProgramImageProps) => {
  return (
    <div
      className={"flex w-full h-[165px] lg:h-[200px] overflow-hidden mx-auto"}
    >
      <Image
        src={src}
        alt={alt}
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-contain  object-top"
      />
    </div>
  );
};

export default ProgramImage;
