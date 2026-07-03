import BigButton from "@/components/big-button";
import HomePostsGrid from "@/components/home/posts-section/home-posts-grid";
import PostsSectionIntro from "@/components/home/posts-section/posts-section-intro";
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
      <PostsSectionIntro
        title={section.title}
        descriptionHtml={sanitizedDescription}
      />

      <HomePostsGrid posts={posts} />

      <div className="title-padding flex justify-center">
        <BigButton as="link" label="view all" href="/posts" mode="big" />
      </div>
    </section>
  );
};

export default HomePostsSection;
