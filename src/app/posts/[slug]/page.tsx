import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BottomBlock from "@/components/bottom-block";
import HeadlineWCross from "@/components/headline-w-cross";
import StaggerEnterContainer from "@/components/stagger-enter-container";
import PostContent from "@/components/posts/post-content";
import { config } from "@/config";
import { getCachedPublishedPostBySlug } from "@/lib/posts/cached-public-posts";
import {
  buildEntityMetadata,
  buildFallbackEntityMetadata,
} from "@/lib/seo/build-entity-metadata";
import { buildPostArticleJsonLd } from "@/lib/seo/build-json-ld";
import { stripHtmlTags } from "@/lib/sanitize-html";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const formatPostDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;

  try {
    const post = await getCachedPublishedPostBySlug(slug);

    if (!post) {
      return buildFallbackEntityMetadata({
        title: `GLUE ${config.cityName} | Post`,
        description: `Post at GLUE ${config.cityName}.`,
        canonicalPath: `/posts/${slug}`,
      });
    }

    const title = `GLUE ${config.cityName} - ${post.title}`;
    const description =
      post.excerpt || stripHtmlTags(post.content_html) || post.title;
    const imageUrl =
      post.media.find((item) => item.image_url)?.image_url ?? undefined;

    return buildEntityMetadata({
      title,
      description,
      canonicalPath: `/posts/${post.slug}`,
      imageUrl,
      imageAlt: post.title,
      keywords: [
        ...post.keywords,
        "GLUE",
        config.cityName,
        "posts",
        "news",
      ],
      authors: post.author ? [post.author] : undefined,
      creator: post.author ?? undefined,
      openGraphType: "article",
      structuredData: buildPostArticleJsonLd(post),
    });
  } catch {
    return buildFallbackEntityMetadata({
      title: `GLUE ${config.cityName} | Post`,
      description: `Post at GLUE ${config.cityName}.`,
      canonicalPath: `/posts/${slug}`,
    });
  }
};

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getCachedPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main id="post-detail-page">
      <StaggerEnterContainer variant="enter">
        <nav className="sr-only" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={config.baseUrl}>Home</a>
            </li>
            <li>
              <a href={`${config.baseUrl}/posts`}>Posts</a>
            </li>
            <li>{post.title}</li>
          </ol>
        </nav>
        <section
          id="post-detail-section"
          className="text-(--black-color) pt-[122px] lg:pt-[113px]"
        >
          <HeadlineWCross
            title={post.title}
            closeFallbackHref="/posts"
            preferCloseFallback
          />
          <div className="max-w-[830px] mx-auto">
            <div className="body-text title-padding text-(--black-color)">
              <p>
                <time dateTime={post.created_at}>
                  {formatPostDate(post.created_at)},
                </time>
              </p>
              {post.author ? <p>By {post.author}</p> : null}
            </div>
            <PostContent html={post.content_html} />
          </div>
        </section>
        <BottomBlock />
      </StaggerEnterContainer>
    </main>
  );
}
