import { config } from "@/config";

import HeroVideo from "@/components/home/hero-section/hero-video";

type Props = {
  videoUrl: string;
  posterUrl: string;
  description: string;
};

const Hero = ({ videoUrl, posterUrl, description }: Props) => {
  const { cityName } = config;
  const videoAriaLabel = `Video introducing GLUE ${cityName} design route from last year`;

  return (
    <>
      {posterUrl ? (
        <link
          rel="preload"
          as="image"
          href={posterUrl}
          fetchPriority="high"
        />
      ) : null}
      <section id="hero">
        <h1 className="sr-only">
          Welcome to GLUE {cityName}, design route. Connecting the best design
          hotspots in town
        </h1>
        <div className="relative mx-auto h-[413px] w-full lg:h-[630px] 2xl:h-[735px]">
          <HeroVideo
            src={videoUrl}
            poster={posterUrl}
            ariaLabel={videoAriaLabel}
          />
        </div>
        <p className="pt-[40px] text-[25px] leading-[31px] font-normal lg:w-[830px] lg:pt-[200px] lg:text-[50px] lg:leading-[58px]">
          {description}
        </p>
      </section>
    </>
  );
};

export default Hero;
