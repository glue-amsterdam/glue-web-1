import { config } from "@/env";
import { ParticipantClient } from "@/lib/client/fetch-participants";
import Image from "next/image";
import Link from "next/link";

export default function ParticipantCard({
  participant,
}: {
  participant: ParticipantClient;
}) {
  return (
    <Link href={`/participants/${participant.slug}`} className="block">
      <div className="bg-black rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative h-48">
          <Image
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={participant.image_url || "/placeholder.jpg"}
            alt={`GLUE ${config.cityName} participant ${participant.user_name} image`}
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">
            {participant.user_name}
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-500 hover:underline">
              View Profile
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
