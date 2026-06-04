import { useEventsDays } from "@/app/context/MainContext";
import type { ExhibitorContactInfo } from "@/lib/participants/exhibitor-detail-types";
import { formatUrl } from "@/utils/formatUrl";
import Link from "next/link";

type ExhibitorDetailInfoProps = {
  contactInfo: ExhibitorContactInfo;
};


const ExhibitorDetailInfo = ({ contactInfo }: ExhibitorDetailInfoProps) => {
  const eventDays = useEventsDays();
  const {
    mapInfo,
    phoneNumbers,
    visibleEmails,
    visibleWebsites,
    socialMedia,
    visitingHours,
    events,
  } = contactInfo;

  const getDayLabel = (dayId: string) => {
    const day = eventDays.find((d) => d.dayId === dayId);
    return day ? day.label : dayId;
  };

  const hasContact =
    (phoneNumbers && phoneNumbers.length > 0) ||
    (visibleEmails && visibleEmails.length > 0) ||
    (visibleWebsites && visibleWebsites.length > 0);

  const hasSocial =
    socialMedia?.instagramLink ||
    socialMedia?.facebookLink ||
    socialMedia?.linkedinLink;

  return (
    <div className="flex flex-col gap-[30px] pt-[30px] wrap-break-word">
      {mapInfo.length > 0 && (
        <section aria-labelledby="exhibitor-address-heading">
          <h3
            id="exhibitor-address-heading"
            className="sr-only"
          >
            Address
          </h3>
          <ul className="">
            {mapInfo.map((map) => (
              <li key={map.id}>
                <Link
                  href={`/map?place=${map.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="base-text-size"
                >
                  {map.formatted_address}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasContact && (
        <section aria-labelledby="exhibitor-contact-heading">
          <h3
            id="exhibitor-contact-heading"
            className="sr-only"
          >
            Contact
          </h3>
          <div className="flex flex-col">
            {phoneNumbers?.map((phone, index) => (
              <a
                key={`phone-${index}`}
                href={`tel:${phone}`}
                className="base-text-size"
              >
                {phone}
              </a>
            ))}
            {visibleEmails?.map((email, index) => (
              <a
                key={`email-${email}-${index}`}
                href={`mailto:${email}`}
                className="base-text-size"
              >
                {email}
              </a>
            ))}
            {visibleWebsites?.map((website, index) => (
              <a
                key={`website-${index}`}
                href={formatUrl(website)}
                target="_blank"
                rel="noopener noreferrer"
                className="base-text-size"
              >
                {website}
              </a>
            ))}
          </div>
        </section>
      )}

      {hasSocial && (
        <section aria-labelledby="exhibitor-social-heading">
          <h3
            id="exhibitor-social-heading"
            className="sr-only"
          >
            Social
          </h3>
          <ul className="">
            {socialMedia?.instagramLink && (
              <li>
                <a
                  href={formatUrl(socialMedia.instagramLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="base-text-size"
                >
                  Instagram
                </a>
              </li>
            )}
            {socialMedia?.facebookLink && (
              <li>
                <a
                  href={formatUrl(socialMedia.facebookLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="base-text-size"
                >
                  Facebook
                </a>
              </li>
            )}
            {socialMedia?.linkedinLink && (
              <li>
                <a
                  href={formatUrl(socialMedia.linkedinLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="base-text-size"
                >
                  LinkedIn
                </a>
              </li>
            )}
          </ul>
        </section>
      )}

      {visitingHours && Object.keys(visitingHours).length > 0 && (
        <section aria-labelledby="exhibitor-hours-heading">
          <h3
            id="exhibitor-hours-heading"
            className="uppercase base-text-size"
          >
            Visiting Hours
          </h3>
          <ul className="">
            {Object.entries(visitingHours).map(([dayId, times]) => {
              if (times.length === 0) {
                return null;
              }

              return (
                <li key={dayId} className="base-text-size">
                  <span>{getDayLabel(dayId)}: </span>
                  {times.map((time, timeIndex) => (
                    <span key={timeIndex}>
                      {time.open} - {time.close}
                      {timeIndex < times.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section aria-labelledby="exhibitor-events-heading">
          <h3
            id="exhibitor-events-heading"
            className="uppercase base-text-size"
          >
            Events
          </h3>
          <ul className="">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/program/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ExhibitorDetailInfo;
