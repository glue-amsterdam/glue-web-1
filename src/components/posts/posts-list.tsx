import Link from "next/link";
import type { PublicPostSummary } from "@/schemas/postSchema";

type PostsListProps = {
  posts: PublicPostSummary[];
};

const formatPostDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const PostsList = ({ posts }: PostsListProps) => {
  if (posts.length === 0) {
    return (
      <p className="base-text-size pt-[40px] lg:max-w-(--paragraph-max-width)">
        No posts published yet.
      </p>
    );
  }

  return (
    <ul className="pt-[40px] lg:pt-[60px] space-y-[40px] lg:space-y-[60px]">
      {posts.map((post) => (
        <li key={post.id}>
          <article aria-labelledby={`post-title-${post.id}`}>
            <h2
              id={`post-title-${post.id}`}
              className="title-text pt-[15px] lg:pt-[30px]"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--black-color)"
              >
                {post.title.toUpperCase()}
              </Link>
            </h2>
            <p className="base-text-size pt-[20px] text-(--black-color)/70">
              {post.author ? `${post.author} · ` : ""}
              <time dateTime={post.created_at}>{formatPostDate(post.created_at)}</time>
            </p>
            {post.excerpt ? (
              <p className="base-text-size pt-[20px] lg:max-w-(--paragraph-max-width)">
                {post.excerpt}
              </p>
            ) : null}
            <div className="pt-[20px]">
              <Link
                href={`/posts/${post.slug}`}
                className="base-text-size underline hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--black-color)"
                aria-label={`Read ${post.title}`}
              >
                Read more
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
};

export default PostsList;
