import Link from "next/link";

interface Participant {
  id: string;
  user_name: string;
  plan_type: string;
  short_description: string | null;
  slug: string | null;
  is_sticky: boolean;
  year: number | null;
  status: string | null;
  image_url?: string | null;
}

function ParticipantCard({ participant }: { participant: Participant }) {
  return (
    <Link
      href={`/participants/${participant.slug}`}
      target="_blank"
      className="bg-uiwhite p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <div className="flex items-center mb-4">
        <img
          src={participant.image_url || "/participant-placeholder.jpg"}
          alt={participant.user_name}
          className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-glueBlue"
        />

        <div>
          <h3 className="font-bold text-xl text-uiblack">
            {participant.user_name}
          </h3>
          <p className="text-sm text-glueBlue">{participant.plan_type}</p>
        </div>
      </div>

      {participant.short_description && (
        <p className="text-uiblack mb-3 line-clamp-2">
          {participant.short_description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {participant.is_sticky && (
          <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full text-xs">
            STICKY
          </span>
        )}
        {participant.year && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            Year: {participant.year}
          </span>
        )}
      </div>
    </Link>
  );
}

export default ParticipantCard;