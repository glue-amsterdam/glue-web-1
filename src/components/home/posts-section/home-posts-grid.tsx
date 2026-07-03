import HomePostCard from "@/components/home/posts-section/home-post-card";
import {
  HOME_POSTS_MOBILE_COUNT,
} from "@/lib/posts/fetch-public-post";
import type { PublicPostSummary } from "@/schemas/postSchema";

type Props = {
  posts: PublicPostSummary[];
  mode?: "home" | "page";
  loading?: boolean;
};

const HomePostsGrid = ({ posts, mode = "home", loading = false }: Props) => {
  if (posts.length === 0) {
    return null;
  }

  const mobilePosts =
    mode === "home" ? posts.slice(0, HOME_POSTS_MOBILE_COUNT) : posts;

  return (
    <ul
      className={`title-padding grid list-none grid-cols-1 gap-y-[40px] lg:grid-cols-3 lg:gap-x-[30px] lg:gap-y-[60px] ${
        loading ? "pointer-events-none opacity-60" : ""
      }`}
      aria-busy={loading}
    >
      <div className="contents lg:hidden">
        {mobilePosts.map((post) => (
          <li key={post.id} className="mx-auto w-full">
            <HomePostCard post={post} />
          </li>
        ))}
      </div>
      <div className="hidden lg:contents">
        {posts.map((post) => (
          <li key={post.id} className="mx-auto w-full">
            <HomePostCard post={post} />
          </li>
        ))}
      </div>
    </ul>
  );
};

export default HomePostsGrid;
