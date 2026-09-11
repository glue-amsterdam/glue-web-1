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

  const handlePlaying = () => {
    const video = videoRef.current;
    if (!video) {
      setIsPlaying(true);
      return;
    }

    const reveal = () => setIsPlaying(true);

    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(() => reveal());
      return;
    }

    reveal();
  };

  return (
    <div className="relative h-full w-full">
      <Image
        src={poster}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover"
        aria-hidden
      />
      <video
        ref={videoRef}
        src={videoSrc ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onPlaying={handlePlaying}
        className={
          isPlaying
            ? "absolute inset-0 z-10 h-full w-full object-cover opacity-100"
            : "absolute inset-0 z-10 h-full w-full object-cover opacity-0"
        }
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default HeroVideo;
