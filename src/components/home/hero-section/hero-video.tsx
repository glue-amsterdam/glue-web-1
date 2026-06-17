"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster: string;
  ariaLabel: string;
};

const HeroVideo = ({ src, poster, ariaLabel }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full h-full object-cover"
      aria-label={ariaLabel}
    />
  );
};

export default HeroVideo;
