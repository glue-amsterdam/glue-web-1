import BigButton from "@/components/big-button";
import HeadlineWCross from "@/components/headline-w-cross";
import type { ProgramDetail } from "@/lib/program/program-types";
import Link from "next/link";
import RoundedNumber from "../rounded-number";
import ProgramFullImage from "./program-full-image";

type Props = {
  event: ProgramDetail;
};

const ProgramDetailView = ({ event }: Props) => {
  return (
    <section
      id="program-detail-section"
      className="text-(--black-color) pt-[122px] lg:pt-[113px] base-text-size"
    >
      <HeadlineWCross title={event.name.toUpperCase()} />
      <div className="max-w-[1045px] w-full mx-auto">
        <div className="mini-padding w-full mx-auto max-w-[1045px]">
          <ProgramFullImage src={event.eventImg} alt={event.name} />
        </div>

        <div className="lg:grid grid-cols-2 lg:gap-[30px] lg:pt-[60px]">
          {event.description ? (
            <article className="mini-padding pb-[30px] lg:pt-0">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </article>
          ) : (<div className="mini-padding" aria-label="No description available"></div>)}

          <article
            id="program-detail-info-section"
            className="border-t border-(--black-color) mini-padding lg:border-t-2"
          >
            <div className="flex items-start gap-[20px]">
              <RoundedNumber
                type={event.organizer.type}
                participant_n={event.organizer.displayNumber || " "}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1 wrap-break-word">
                <p>{event.date.label}</p>
                <p>{event.startTime && event.endTime
                  ? `${event.startTime} – ${event.endTime}`
                  : ""}</p>
                <p>{event.type}</p>
                <h2 className="mini-padding">ORGANISER</h2>
                <p className="truncate">
                  {event.organizer.userName}
                  {event.coOrganizers.length > 0 &&
                    ` x ${event.coOrganizers.map((c) => c.userName).join("x ")}`}
                </p>
                {event.location?.formattedAddress ? (
                  <p className="mini-padding flex flex-col">
                    <span>ADDRESS </span>
                    <Link
                      href={`/map?place=${event.location.id}`}
                      className="hover-link"
                      rel="noopener noreferrer"
                    >
                      {event.location.formattedAddress}
                    </Link>
                  </p>
                ) : null}

                {event.rsvp && event.rsvpLink && (
                  <div className="mini-padding">
                    <BigButton
                      as="link"
                      href={event.rsvpLink}
                      label="registration"
                      mode="big"
                    />
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div >
    </section >
  );
};

export default ProgramDetailView;
