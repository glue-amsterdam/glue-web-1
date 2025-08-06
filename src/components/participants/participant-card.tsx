import { config } from "@/env";
import { ParticipantClient } from "@/lib/client/fetch-participants";
import Image from "next/image";
import Link from "next/link";

export default function ParticipantCard({
  participant,
  size = "col-span-1 row-span-1",
}: {
  participant: ParticipantClient;
  size?: string;
  variant?: string;
}) {
  // Determine height classes based on size
  const getHeightClass = () => {
    if (size.includes("row-span-2")) {
      return "h-80 md:h-96"; // Taller for 2-row cards
    }
    return "h-48"; // Normal height
  };

  const getTextSize = () => {
    if (size.includes("col-span-2") && size.includes("row-span-2")) {
      return "text-2xl"; // Larger text for large cards
    }
    if (size.includes("row-span-2")) {
      return "text-xl"; // Medium text for tall cards
    }
    return "text-lg"; // Normal text
  };

  return (
    <Link
      target="_blank"
      href={`/participants/${participant.slug}`}
      className="block h-full"
    >
      <div className={`transition-transform h-full group hover:scale-[0.95]`}>
        <div className={`relative ${getHeightClass()} flex-shrink-0`}>
          <Image
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={participant.image_url || "/placeholder.jpg"}
            alt={`GLUE ${config.cityName} participant ${participant.user_name} image`}
            className="object-cover"
          />

          {/* Mobile: User name overlaid on image at top-left */}
          <div className="absolute top-2 left-2 z-10 md:hidden">
            <h2 className={`font-semibold ${getTextSize()} text-white`}>
              {participant.user_name}
            </h2>
          </div>

          {/* Desktop: Hover overlay with centered name and black background */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 ease-in-out md:flex md:items-center md:justify-center">
            <h2
              className={`font-overpass ${getTextSize()} text-white hidden md:block transform scale-0 group-hover:scale-100 transition-all duration-300 ease-out `}
            >
              {participant.user_name}
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
}
