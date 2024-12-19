import { ParticipantClient } from "@/lib/client/fetch-participants";
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
          {participant.image_url ? (
            <img
              src={participant.image_url || "/participant-placeholder.jpg"}
              alt={`GLUE ${process.env.NEXT_PUBLIC_MAIN_CITY_GLUE_EVENT} participant ${participant.user_name} image`}
              className="object-cover absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-2xl">
                {participant.user_name[0]}
              </span>
            </div>
          )}
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
