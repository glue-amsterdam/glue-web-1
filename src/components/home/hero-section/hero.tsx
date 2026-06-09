import { config } from "@/config";

type Props = {
  videoUrl: string;
  posterUrl: string;
  description: string;
};

const Hero = ({ videoUrl, posterUrl, description }: Props) => {
  const { cityName } = config;
  const videoAriaLabel = `Video introducing GLUE ${cityName} design route from last year`;

  return (
    <section id="hero">
      <h1 className="sr-only">
        Welcome to GLUE {cityName}, design route. Connecting the best design
        hotspots in town
      </h1>
      <div className="relative w-full h-[413px] lg:h-[630px] 2xl:h-[735px] mx-auto">
        <video
          src={videoUrl}
          autoPlay
          poster={posterUrl}
          muted
          loop
          className="w-full h-full object-cover"
          aria-label={videoAriaLabel}
        />
      </div>
      <p className="text-[25px] lg:text-[50px] lg:leading-[58px] pt-[40px] lg:pt-[200px] leading-[31px] font-[400] lg:w-[830px]">
        {description}
      </p>
    </section>
  );
};

export default Hero;
