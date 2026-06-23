import BigButton from "@/components/big-button";
import SanitizedDescription from "@/components/sanitized-description";
import type { HomeStickyParticipant } from "@/lib/home/types";
import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  year: number | null;
  groupPhotoUrl: string | null;
  additionalMembersText?: string;
  participants: HomeStickyParticipant[];
  sectionId?: string;
  showCta?: boolean;
};

const StickyParticipantsSection = ({
  title,
  description,
  year,
  groupPhotoUrl,
  additionalMembersText = "",
  participants,
  sectionId = "sticky-participants-section",
  showCta = true,
}: Props) => {
  const stickyTitle = year != null ? `Sticky participants ${year}` : "Sticky participants";
  const trimmedAdditionalText = additionalMembersText.trim();
  const hasParticipants = participants.length > 0;
  const hasAdditionalText = trimmedAdditionalText.length > 0;

  if (!hasParticipants && !hasAdditionalText) {
    return null;
  }

  return (
    <section id={sectionId} className="main-padding">
      <h2 className="title-text border-t md:border-t-2 border-(--black-color) pt-[15px] md:pt-[30px]">
        {title.toUpperCase()}
      </h2>
      <article className="pt-[40px] md:pt-[60px] w-full max-w-[1045px] mx-auto">
        {groupPhotoUrl ? (
          <Image
            width={1045}
            height={1045}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 609px, 1045px"
            src={groupPhotoUrl}
            alt={`${title} group photo`}
            className="w-full h-auto"
          />
        ) : null}
        <div className="pt-[40px] lg:flex lg:gap-[30px]">
          <SanitizedDescription
            description={description}
            className="p-0 lg:max-w-none base-text-size flex-1"
          />
          <div className="pt-[40px] lg:pt-0 flex-1">
            <h3 className="base-text-size">{stickyTitle.toUpperCase()}</h3>
            <ul className="pt-[15px] flex flex-wrap">
              {participants.map((participant, index) => (
                <li key={participant.userId} className="base-text-size">
                  {participant.slug ? (
                    <Link href={`/exhibitors/${participant.slug}`}>
                      {participant.userName}
                    </Link>
                  ) : (
                    <span>{participant.userName}</span>
                  )}
                  {index < participants.length - 1 || hasAdditionalText ? `, ${" "}` : null}
                </li>
              ))}
              {hasAdditionalText ? (
                <li className="base-text-size">
                  <span>{trimmedAdditionalText}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </article>
      {showCta ? (
        <div className="pt-[40px] flex justify-center">
          <BigButton
            as="link"
            label="show details"
            href="/exhibitors"
            mode="big"
          />
        </div>
      ) : null}
    </section>
  );
};

export default StickyParticipantsSection;
