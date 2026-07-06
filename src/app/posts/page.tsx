import { Suspense } from "react";
import type { Metadata } from "next";
import PostsClientPage from "@/app/posts/posts-client-page";
import BottomBlock from "@/components/bottom-block";
import PostsSectionIntro from "@/components/home/posts-section/posts-section-intro";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import { config } from "@/config";
import { fetchPostsPage } from "@/lib/posts/fetch-posts-page";
import { buildPostsPageQueryParams } from "@/lib/posts/posts-url";
import { postsMetadata } from "@/lib/metadata";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { buildPostsCollectionJsonLd } from "@/lib/seo/build-json-ld";
import { getCachedTextSection } from "@/lib/text-sections/cached-text-sections";
import LoadingSpinner from "../components/LoadingSpinner";

export const metadata: Metadata = postsMetadata;

export default async function PostsPage() {
  const [initialData, section] = await Promise.all([
    fetchPostsPage(buildPostsPageQueryParams(0)),
    getCachedTextSection("home-posts"),
  ]);
  const sanitizedDescription = sanitizeHtml(section.description);
  const structuredData = buildPostsCollectionJsonLd(initialData.items);

  return (
    <main id="posts-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <StaggerEnterContainer variant="enter" className="terms-and-conditions-padding min-h-dvh">
        <nav className="sr-only" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={config.baseUrl}>Home</a>
            </li>
            <li>Posts</li>
          </ol>
        </nav>
        <section id="posts-section">
          <h1 className="title-text">
            {section.title.toUpperCase()}
          </h1>
          <div
            className="title-padding lg:max-w-(--paragraph-max-width) body-label post-content"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <PostsClientPage initialData={initialData} />
          </Suspense>
        </section>
        <BottomBlock />
      </StaggerEnterContainer>
    </main>
  );
}
