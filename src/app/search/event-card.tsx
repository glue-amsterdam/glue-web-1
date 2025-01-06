import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  co_organizers: string[];
  co_organizers_names: string[];
  image_url?: string | null;
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events?eventId=${event.id}`}
      target="_blank"
      className="bg-uiwhite p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-24 object-cover mb-4 rounded-md"
        />
      )}
      <h3 className="font-bold text-xl text-uiblack mb-2">{event.title}</h3>
      <p className="text-sm text-uiblack mb-4 line-clamp-3">
        {event.description}
      </p>
      <div className="flex flex-col">
        <p className="text-sm text-glueBlue">
          Organizer: {event.organizer_name}
        </p>
        {event.co_organizers_names.length > 0 && (
          <p className="text-sm text-glueBlue mt-1">
            Co-organizers: {event.co_organizers_names.join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}

export default EventCard;
