import type { Metadata } from "next";
import BottomBlock from "@/components/bottom-block";
import MainContainer from "@/components/main-container";
import PostsList from "@/components/posts/posts-list";
import { config } from "@/config";
import { getCachedPublishedPosts } from "@/lib/posts/cached-public-posts";
import { postsMetadata } from "@/lib/metadata";
import { buildPostsCollectionJsonLd } from "@/lib/seo/build-json-ld";

export const metadata: Metadata = postsMetadata;

export default async function PostsPage() {
  const posts = await getCachedPublishedPosts();
  const structuredData = buildPostsCollectionJsonLd(posts);

  return (
    <main id="posts-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MainContainer className="cta-padding">
        <nav className="sr-only" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={config.baseUrl}>Home</a>
            </li>
            <li>Posts</li>
          </ol>
        </nav>
        <section id="posts-section">
          <h1 className="title-text">POSTS</h1>
          <p className="sr-only">
            Read the latest news and stories from GLUE {config.cityName}.
          </p>
          <PostsList posts={posts} />
        </section>
        <BottomBlock />
      </MainContainer>
    </main>
  );
}
