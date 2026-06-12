import Link from "next/link";

import BigButton from "@/components/big-button";
import { getCachedHomePosts } from "@/lib/posts/cached-public-posts";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";

const loadHomePosts = async () => {
  try {
    return await getCachedHomePosts();
  } catch (error) {
    console.error("[home] Failed to load posts:", error);
    return [];
  }
};

const HomePostsSection = async () => {
  const [section, posts] = await Promise.all([
    getCachedTextSection("home-posts"),
    loadHomePosts(),
  ]);

  const sanitizedDescription = sanitizeHtml(section.description);

  return (
    <section id={section.sectionId}>
      <h2 className="title-text pt-[15px] lg:pt-[30px]">
        {section.title.toUpperCase()}
      </h2>
      <div
        className="pt-[40px] lg:max-w-(--paragraph-max-width) base-text-size"
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />

      {posts.length > 0 ? (
        <ul className="pt-[40px] lg:pt-[60px] space-y-[20px] lg:space-y-[30px]">
          {posts.map((post) => (
            <li key={post.id}>
              <h3 className="base-text-size">-
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--black-color)"
                  aria-label={`Read ${post.title}`}
                >
                  {post.title.toUpperCase()}
                </Link>
              </h3>

            </li>
          ))}
        </ul>
      ) : null}

      <div className="pt-[40px] lg:pt-[60px] flex justify-center">
        <BigButton as="link" label="view all" href="/posts" mode="big" />
      </div>
    </section>
  );
};

export default HomePostsSection;
