"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { PopupInfo } from "@/app/map/map-component";
import { MapPin } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

interface Props {
  popupInfo: PopupInfo;
}

function CarouselPopUp({ popupInfo }: Props) {
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
    })
  );

  const handleMouseEnter = () => {
    autoplay.current.stop();
  };

  const handleMouseLeave = () => {
    autoplay.current.play();
  };

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const uniqueParticipants = popupInfo.participants.filter(
    (participant, index, self) =>
      index === self.findIndex((t) => t.user_id === participant.user_id)
  );

  const handleGoogleMapsRedirect = useCallback(
    (address: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const encodedAddress = encodeURIComponent(address);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        "_blank"
      );
    },
    []
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full bg-[var(--color-box1)]"
    >
      <Carousel
        plugins={[autoplay.current]}
        setApi={setApi}
        className="w-full"
        key={popupInfo.id}
      >
        <CarouselContent>
          {uniqueParticipants.map((participant, index) => (
            <CarouselItem key={`${participant.user_id}-${index}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent z-10" />
                <div className="relative w-full h-48">
                  <Image
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    fill
                    src={
                      participant.image_url || "/participant-placeholder.jpg"
                    }
                    alt={`Image of ${participant.user_name}`}
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="absolute top-4 left-0 right-0 p-4 z-20">
                  <h3 className="font-semibold text-lg leading-tight text-white mb-1">
                    {participant.user_name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2">
                    {popupInfo.formatted_address}
                  </p>
                </div>
              </div>
              <div className="p-4">
                {popupInfo.is_hub && (
                  <p className="text-sm font-medium text-white mb-2">
                    {participant.is_host && "HUB host"}
                  </p>
                )}
                {popupInfo.is_collective && (
                  <p className="text-sm font-medium text-white mb-2">
                    Collective
                    {participant.is_host && "Colective HUB host"}
                  </p>
                )}
                {popupInfo.is_special_program && (
                  <p className="text-sm font-medium text-white mb-2">
                    Special Program
                  </p>
                )}
                {!popupInfo.is_hub &&
                  !popupInfo.is_collective &&
                  !popupInfo.is_special_program && (
                    <p className="text-sm font-medium text-white mb-2">
                      Participant
                    </p>
                  )}
                <div className="flex gap-2 items-center flex-wrap">
                  <Link
                    href={`/participants/${participant.slug}`}
                    passHref
                    target="_blank"
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      variant="default"
                      className="w-full bg-black hover:bg-[var(--color-triangle)] text-white hover:text-black transition-colors duration-200"
                    >
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white hover:bg-[var(--color-triangle)] text-black hover:text-white transition-colors duration-200"
                    onClick={(e) =>
                      handleGoogleMapsRedirect(popupInfo.formatted_address, e)
                    }
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Google map view
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 z-30 text-black" />
        <CarouselNext className="absolute right-2 z-30 text-black" />
      </Carousel>

      <div className="flex justify-center mt-2 pb-2">
        {uniqueParticipants.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 mx-1 rounded-full ${
              index === current ? "bg-black" : "bg-white"
            }`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>

      {(popupInfo.is_hub || popupInfo.is_collective) && (
        <div className="mt-2 p-4 pt-0">
          <h4 className="font-semibold mb-2">
            {popupInfo.is_hub ? "Hub" : "Collective"} Participants:
          </h4>
          <ul className="flex items-center justify-between flex-wrap">
            {uniqueParticipants.map((participant, index) => (
              <li
                key={participant.user_id}
                className={`flex items-center justify-center cursor-pointer hover:bg-gray/50 p-2 rounded transition-colors duration-200 ${
                  index === current ? "bg-gray/20" : ""
                }`}
                onClick={() => scrollTo(index)}
              >
                <div>
                  {participant.user_name}
                  {participant.is_host && (
                    <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded-full">
                      Host
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CarouselPopUp;
