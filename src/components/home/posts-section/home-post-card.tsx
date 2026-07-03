import Link from "next/link";

import ExhibitorImage from "@/components/exhibitors/exhibitor-image";
import PlusButtonMobile from "@/components/icons/plus-button-mobile";
import PlusIconDesktop from "@/components/icons/plus-icon-desktop";
import type { PublicPostSummary } from "@/schemas/postSchema";

type Props = {
  post: PublicPostSummary;
};

const formatShortPostDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const HomePostCard = ({ post }: Props) => {
  const href = `/posts/${post.slug}`;

  const content = (
    <article className="body-text mx-auto max-w-[400px] overflow-hidden border-t border-(--black-color) pt-[15px] lg:border-t-2">
      <div className="flex items-start justify-between gap-[20px]">
        <p>
          <time dateTime={post.created_at}>
            {formatShortPostDate(post.created_at)}
          </time>
        </p>
        <div className="shrink-0 lg:hidden">
          <PlusButtonMobile />
        </div>
        <div className="hidden shrink-0 lg:block">
          <PlusIconDesktop />
        </div>
      </div>
      <h2 className="versal-body-text">
        {post.title.toUpperCase()}
      </h2>
      {post.cover_image_url ? (
        <div className="w-full pt-[15px]">
          <ExhibitorImage src={post.cover_image_url} alt={post.title} />
        </div>
      ) : null}
    </article>
  );

  return (
    <Link
      href={href}
      className="group block"
      aria-label={`Read ${post.title}`}
      tabIndex={0}
    >
      {content}
    </Link>
  );
};

export default HomePostCard;
