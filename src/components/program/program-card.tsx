import Link from "next/link";
import ProgramImage from "@/components/program/program-image";
import RoundedNumber from "@/components/rounded-number";
import { getProgramLink } from "@/lib/program/program-filters";
import type { ProgramListItem } from "@/lib/program/program-types";
import PlusButtonMobile from "../icons/plus-button-mobile";
import PlusIconDesktop from "../icons/plus-icon-desktop";

type Props = {
  event: ProgramListItem;
};

const ProgramCard = ({ event }: Props) => {
  const href = getProgramLink(event.eventId);

  const content = (
    <article className="mx-auto w-full max-w-[400px] body-text border-t lg:border-t-2 border-(--black-color) pt-[15px] overflow-hidden lg:mx-0">
      <div className="flex items-start gap-[20px]">
        <RoundedNumber
          type={event.organizer.type}
          participant_n={event.organizer.displayNumber || " "}
        />
        <div className="min-w-0 flex-1">
          <p>{event.date.label}</p>
          <p>
            {event.startTime && event.endTime
              ? `${event.startTime} – ${event.endTime}`
              : ""}
          </p>
          <p>{event.type}</p>
          <div className="program-card-padding">
            <ProgramImage src={event.eventImg} alt={event.name} />
          </div>
          <h2 className="program-card-padding versal-body-text line-clamp-2">
            {event.name.toUpperCase()}
          </h2>
          <p className="body-text text-(--black-color) truncate">
            {event.organizer.userName}
            {event.coOrganizers.length > 0 &&
              ` x ${event.coOrganizers.map((c) => c.userName).join("x ")}`}
          </p>
        </div>

        <div>
          <div className="shrink-0 lg:hidden">
            <PlusButtonMobile />
          </div>
          <div className="hidden shrink-0 lg:block">
            <PlusIconDesktop />
          </div>
        </div>
      </div>

    </article>
  );

  return (
    <Link
      href={href}
      className="group block"
      aria-label={`View ${event.name} program event`}
      tabIndex={0}
    >
      {content}
    </Link>
  );
};

export default ProgramCard;
