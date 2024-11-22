import { OptimizedParticipant } from "@/app/api/participants/optimized/route";
import Image from "next/image";
import Link from "next/link";

export default function ParticipantCard({
  participant,
}: {
  participant: OptimizedParticipant;
}) {
  return (
    <Link href={`/participants/${participant.slug}`} className="block">
      <div className="bg-black rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative h-48">
          {participant.imageUrl ? (
            <Image
              src={participant.imageUrl}
              alt={participant.userName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-2xl">
                {participant.userName[0]}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{participant.userName}</h2>
          <p className="text-gray-600 text-sm mb-2">
            {participant.shortDescription}
          </p>
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