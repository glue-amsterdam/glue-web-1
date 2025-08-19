/* TODO remove all espanish comments/texts */

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { ParticipantClient } from "@/schemas/participantsSchema";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "next-view-transitions";

export default function ParticipantsCarousel({
  participants,
  activeIndex,
  setActiveIndex,
  carouselRef,
  textColor,
}: {
  participants: ParticipantClient[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  carouselRef: React.RefObject<HTMLDivElement>;
  textColor: string;
}) {
  return (
    <div
      ref={carouselRef}
      id="participants-carousel"
      className="w-full flex flex-col items-center z-[39] px-2"
    >
      {/* Row 2: Carousel with navigation */}
      <div className="relative w-full flex items-center">
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
          plugins={[
            Autoplay({
              delay: 2000,
              stopOnInteraction: true,
            }),
          ]}
        >
          <CarouselPrevious
            style={{ backgroundColor: textColor }}
            className="absolute left-0 z-10 text-white rounded-none hover:scale-[0.95] hover:text-white"
          />
          <CarouselContent className="mx-12">
            {participants.map((participant, idx) => (
              <CarouselItem
                key={participant.slug + idx}
                className="basis-auto px-2"
              >
                <button
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Select participant ${participant.userName}`}
                  tabIndex={0}
                  className={`h-[10vh] md:h-[8vh] w-[20vh] shrink-0 overflow-hidden transition-transform duration-200`}
                  type="button"
                >
                  <Card className="border-none bg-transparent h-full w-full">
                    <CardContent className="p-0 h-full w-full relative group">
                      <Image
                        src={participant.image?.image_url || "/placeholder.jpg"}
                        alt={`${participant.userName} profile image thumbnail`}
                        width={900}
                        height={900}
                        className={`absolute inset-0 w-full h-full object-cover hover:grayscale-[0.3] ${
                          idx === activeIndex
                            ? "grayscale-0"
                            : "grayscale-[0.5]"
                        }`}
                        priority={false}
                      />
                      <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-center font-semibold text-xs sm:text-sm truncate px-2">
                          {participant.userName}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext
            style={{ backgroundColor: textColor }}
            className="absolute right-0 z-10 text-white rounded-none hover:scale-[0.95] hover:text-white"
          />
        </Carousel>
      </div>
      <p
        style={{ color: textColor }}
        className="text-xs md:text-sm text-center"
      >
        These are just 30 randomly chosen participants. Want to explore them
        all?{" "}
        <Link href="/participants">
          <span
            className="underline transition-all duration-100
          "
          >
            Click here.
          </span>
        </Link>
      </p>
    </div>
  );
}
