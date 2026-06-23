"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster: string;
  ariaLabel: string;
};

const HeroVideo = ({ src, poster, ariaLabel }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVideo = () => setVideoSrc(src);

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(loadVideo);
      return () => cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(loadVideo, 0);
    return () => window.clearTimeout(timeoutId);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      video?.pause();
    };
  }, []);

  const handleVideoReady = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-full">
      {!isPlaying && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
      )}
      <video
        ref={videoRef}
        src={videoSrc ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onCanPlay={handleVideoReady}
        onPlaying={handleVideoReady}
        className={
          isPlaying
            ? "relative z-10 h-full w-full object-cover"
            : "absolute inset-0 h-full w-full object-cover opacity-0"
        }
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default HeroVideo;
