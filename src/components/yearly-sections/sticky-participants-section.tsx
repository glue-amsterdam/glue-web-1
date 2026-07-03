import BigButton from "@/components/big-button";
import SanitizedDescription from "@/components/sanitized-description";
import type { HomeStickyParticipant } from "@/lib/home/types";
import { cn } from "@/lib/utils";
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
  hasPadding?: boolean;
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
  hasPadding = true,
}: Props) => {
  const stickyTitle = year != null ? `Sticky participants ${year}` : "Sticky participants";
  const trimmedAdditionalText = additionalMembersText.trim();
  const hasParticipants = participants.length > 0;
  const hasAdditionalText = trimmedAdditionalText.length > 0;

  if (!hasParticipants && !hasAdditionalText) {
    return null;
  }

  return (
    <section id={sectionId} className={cn(hasPadding ? "main-padding" : "p-0")}>
      <h2 className="title-text border-t md:border-t-2 border-(--black-color) mini-padding">
        {title.toUpperCase()}
      </h2>
      <article className="title-padding w-full max-w-[1045px] mx-auto">
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
        <div className="title-padding lg:flex lg:gap-[30px]">
          <SanitizedDescription
            description={description}
            className="p-0 lg:max-w-none body-text flex-1"
          />
          <div className="pt-[40px] lg:pt-0 flex-1">
            <h3 className="body-text">{stickyTitle.toUpperCase()}</h3>
            <ul className="mini-padding flex flex-wrap">
              {participants.map((participant, index) => (
                <li key={participant.userId} className="body-text">
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
                <li className="body-text">
                  <span>{trimmedAdditionalText}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </article>
      {showCta ? (
        <div className="title-padding flex justify-center">
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
