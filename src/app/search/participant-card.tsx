import Image from "next/image";
import Link from "next/link";

interface Participant {
  id: string;
  user_name: string;
  plan_type: string;
  participant_details: {
    short_description: string | null;
    description: string | null;
    slug: string | null;
    is_sticky: boolean;
    status: string;
  };
  image_url: string | null;
}

function ParticipantCard({ participant }: { participant: Participant }) {
  return (
    <Link
      href={`/participants/${participant.participant_details.slug}`}
      target="_blank"
      className="bg-uiwhite p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div className="flex items-center mb-4">
        <div className="size-36 mr-4 relative">
          <Image
            width={144}
            height={144}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={participant.image_url || "/placeholder.jpg"}
            alt={"GLUE profile picture of participant" + participant.user_name}
            className="absolute inset-0 w-full h-full rounded-full object-cover"
          />
        </div>

        <div>
          <h3 className="font-bold text-xl text-uiblack">
            {participant.user_name}
          </h3>
          <p className="text-sm text-glueBlue">{participant.plan_type}</p>
        </div>
      </div>

      {participant.participant_details.short_description && (
        <p className="text-uiblack mb-3 line-clamp-2">
          {participant.participant_details.short_description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {participant.participant_details.is_sticky && (
          <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full text-xs">
            STICKY
          </span>
        )}
      </div>
    </Link>
  );
}

export default ParticipantCard;
