import Link from "next/link";
import ExhibitorImage from "@/components/exhibitors/exhibitor-image";
import RoundedNumber from "@/components/rounded-number";
import type { ExhibitorItem } from "@/lib/participants/exhibitor-types";
import {
  getExhibitorDisplayNumber,
  getExhibitorLink,
} from "@/lib/participants/exhibitors-filters";

type Props = {
  exhibitor: ExhibitorItem;
};

const ExhibitorCard = ({ exhibitor }: Props) => {
  const displayNumber = getExhibitorDisplayNumber(exhibitor);
  const href = getExhibitorLink(exhibitor);

  const content = (
    <article className="max-w-[400px] max-h-[260px] lg:max-h-[310px] border-t lg:border-t-2 border-(--black-color) pt-[15px] overflow-hidden">
      <div className="flex items-center gap-[20px]">
        <RoundedNumber type={exhibitor.type} participant_n={displayNumber} />
        <h2 className="text-[15px] leading-[21px] font-normal text-(--black-color)">
          {exhibitor.name.toUpperCase()}
        </h2>
      </div>
      <div className="pt-[15px] w-full">
        <ExhibitorImage src={exhibitor.imageUrl} alt={exhibitor.name} />
      </div>
    </article>
  );

  if (!href) {
    return (
      <div aria-label={`${exhibitor.name} exhibitor card`}>{content}</div>
    );
  }

  return (
    <Link
      href={href}
      className="group block"
      aria-label={`View ${exhibitor.name} exhibitor profile`}
      tabIndex={0}
    >
      {content}
    </Link>
  );
};

export default ExhibitorCard;
