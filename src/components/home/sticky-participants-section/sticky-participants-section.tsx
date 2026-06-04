import BigButton from "@/components/big-button";
import type { HomeStickyGroupData } from "@/lib/home/types";
import Link from "next/link";

type Props = {
  data: HomeStickyGroupData;
};

const StickyParticipantsSection = ({
  data: { title, description, is_visible, participants, group_photo_url },
}: Props) => {
  const sticky_title = "Sticky participants 2026";

  if (!is_visible) {
    return null;
  }

  return (
    <section id="sticky-participants-section" className="main-padding">
      <h2 className="title-text border-t md:border-t-2 border-[var(--black-color)] pt-[15px] md:pt-[30px]">
        {title.toUpperCase()}
      </h2>
      <article className="pt-[40px] md:pt-[60px] w-full max-w-[1045px] mx-auto">
        <img
          src={group_photo_url ?? ""}
          alt={`${title} group photo`}
          className="w-full h-auto"
        />
        <div className="pt-[40px] lg:flex lg:gap-[30px]">
          <p className="base-text-size flex-1">{description}</p>
          <div className="pt-[40px] lg:pt-0 flex-1">
            <h3 className="base-text-size">{sticky_title.toUpperCase()}</h3>
            <ul className="pt-[15px] flex flex-wrap">
              {participants.map((participant, index) => (
                <li key={participant.userId} className="base-text-size">
                  <Link href={`/participants/${participant.slug}`}>
                    {participant.userName}
                  </Link>
                  {index < participants.length - 1 ? `, ${" "}` : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
      <div className="pt-[40px] flex justify-center">
        <BigButton
          as="link"
          label="show details"
          href="/exhibitors"
          mode="big"
        />
      </div>
    </section>
  );
};

export default StickyParticipantsSection;
