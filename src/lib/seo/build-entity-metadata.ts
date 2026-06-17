import type { Metadata } from "next";
import { config } from "@/config";
import { stripHtmlTags } from "@/lib/sanitize-html";

const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;
const META_DESCRIPTION_MAX = 160;

export const truncateMetaDescription = (
  text: string,
  max = META_DESCRIPTION_MAX
): string => {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max - 1).trim()}…`;
};

type BuildEntityMetadataOptions = {
  title: string;
  description: string;
  canonicalPath: string;
  imageUrl?: string | null;
  imageAlt?: string;
  keywords?: string[];
  authors?: string[];
  creator?: string;
  indexable?: boolean;
  openGraphType?: "website" | "profile" | "article";
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

export const buildEntityMetadata = ({
  title,
  description,
  canonicalPath,
  imageUrl,
  imageAlt,
  keywords = [],
  authors,
  creator,
  indexable = true,
  openGraphType = "website",
  structuredData,
}: BuildEntityMetadataOptions): Metadata => {
  const defaultImage = `${config.baseUrl}/${config.cityName}/og-image.jpg`;
  const resolvedImage = imageUrl?.trim() || defaultImage;
  const metaDescription = truncateMetaDescription(stripHtmlTags(description));
  const canonical = `${config.baseUrl}${canonicalPath}`;

  const metadata: Metadata = {
    title,
    description: metaDescription,
    keywords: keywords.filter(Boolean),
    ...(authors?.length
      ? { authors: authors.map((name) => ({ name })) }
      : {}),
    ...(creator
      ? { creator, publisher: `GLUE ${config.cityName}` }
      : {}),
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: metaDescription,
      url: canonical,
      siteName: `GLUE ${config.cityName}`,
      locale: "en_US",
      type: openGraphType,
      images: [
        {
          url: resolvedImage,
          width: DEFAULT_OG_WIDTH,
          height: DEFAULT_OG_HEIGHT,
          alt: imageAlt ?? title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [resolvedImage],
    },
  };

  if (structuredData) {
    metadata.other = {
      "application/ld+json": JSON.stringify(structuredData),
    };
  }

  return metadata;
};

export const buildFallbackEntityMetadata = ({
  title,
  description,
  canonicalPath,
}: {
  title: string;
  description: string;
  canonicalPath: string;
}): Metadata =>
  buildEntityMetadata({
    title,
    description,
    canonicalPath,
    indexable: false,
  });
