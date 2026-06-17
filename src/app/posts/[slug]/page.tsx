import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BottomBlock from "@/components/bottom-block";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";
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

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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
      <MainContainer className="stagger-enter">
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

          <p className="base-text-size pt-[20px] text-(--black-color)/70">
            {post.author ? (
              <span>
                By {post.author}
                {" · "}
              </span>
            ) : null}
            <time dateTime={post.created_at}>
              {formatPostDate(post.created_at)}
            </time>
          </p>
          <PostContent html={post.content_html} />

        </section>
        <BottomBlock />
      </MainContainer>
    </main>
  );
}
