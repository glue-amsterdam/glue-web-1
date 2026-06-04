import Image from "next/image";

const IMAGE_WIDTH = 450;
const IMAGE_HEIGHT = 242;

type ExhibitorImageProps = {
  src: string;
  alt: string;
};

const ExhibitorImage = ({ src, alt }: ExhibitorImageProps) => {
  return (
    <div
      className={"flex w-full h-[208px] md:h-[242px] overflow-hidden mx-auto"}
    >
      <Image
        src={src}
        alt={alt}
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="h-full w-full object-contain object-top"
      />
    </div>
  );
};

export default ExhibitorImage;
