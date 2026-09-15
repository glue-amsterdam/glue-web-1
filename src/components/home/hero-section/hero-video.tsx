"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MD_UP_QUERY = "(min-width: 440px)";

type Props = {
  srcMobile: string;
  srcDesktop: string;
  poster: string;
  ariaLabel: string;
};

const HeroVideo = ({ srcMobile, srcDesktop, poster, ariaLabel }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMdUp, setIsMdUp] = useState<boolean | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MD_UP_QUERY);
    const handleChange = () => setIsMdUp(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isMdUp === null) return;

    const activeSrc = isMdUp ? srcDesktop : srcMobile || srcDesktop;

    setIsPlaying(false);
    setVideoSrc(null);

    const video = videoRef.current;
    video?.pause();

    const loadVideo = () => setVideoSrc(activeSrc);

    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(loadVideo);
      return () => cancelIdleCallback(id);
    }

    const timeoutId = window.setTimeout(loadVideo, 0);
    return () => window.clearTimeout(timeoutId);
  }, [isMdUp, srcDesktop, srcMobile]);

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

  const showPoster = isMdUp === true && Boolean(poster);

  return (
    <div className="relative h-full w-full">
      {showPoster ? (
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
      ) : null}
      <video
        ref={videoRef}
        key={videoSrc ?? "awaiting-src"}
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
