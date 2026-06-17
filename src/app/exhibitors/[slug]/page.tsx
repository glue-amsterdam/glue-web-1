import BottomBlock from "@/components/bottom-block";
import ExhibitorDeclined from "@/components/exhibitors/exhibitor-declined";
import ExhibitorDetailView from "@/components/exhibitors/exhibitor-detail-view";
import ExhibitorPending from "@/components/exhibitors/exhibitor-pending";
import MainContainer from "@/components/main-container";
import { config } from "@/config";
import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { fetchExhibitorDetailBySlug } from "@/lib/participants/fetch-exhibitor-detail";
import { toDisplayPropsFromParticipant } from "@/lib/participants/map-exhibitor-display-props";
import {
  buildEntityMetadata,
  buildFallbackEntityMetadata,
} from "@/lib/seo/build-entity-metadata";
import { buildExhibitorPersonJsonLd } from "@/lib/seo/build-json-ld";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const isPublicExhibitor = (status: string, isSticky: boolean) =>
  isSticky || status === "accepted";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const exhibitor = await fetchExhibitorDetailBySlug(slug);
    const title = `GLUE ${config.cityName} - ${exhibitor.name}`;
    const description =
      exhibitor.description ??
      `Discover ${exhibitor.name} at GLUE ${config.cityName}.`;
    const indexable = isPublicExhibitor(exhibitor.status, exhibitor.is_sticky);

    return buildEntityMetadata({
      title,
      description,
      canonicalPath: `/exhibitors/${slug}`,
      imageUrl: exhibitor.imageUrl,
      imageAlt: `Profile image of ${exhibitor.name}`,
      keywords: [
        "GLUE",
        config.cityName,
        exhibitor.name,
        "exhibitor",
        "design routes",
      ],
      authors: [exhibitor.name],
      creator: exhibitor.name,
      indexable,
      openGraphType: "profile",
      structuredData: indexable
        ? buildExhibitorPersonJsonLd(exhibitor)
        : undefined,
    });
  } catch {
    return buildFallbackEntityMetadata({
      title: `GLUE ${config.cityName} | Exhibitor`,
      description: `Exhibitor profile at GLUE ${config.cityName}.`,
      canonicalPath: `/exhibitors/${slug}`,
    });
  }
}

export default async function ExhibitorPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const participant = await fetchExhibitorDetailBySlug(slug);

    if (participant.is_sticky || participant.status === "accepted") {
      return (
        <main id="exhibitor-detail-page">
          <MainContainer className="stagger-enter-fade">
            <nav className="sr-only" aria-label="Breadcrumb">
              <ol>
                <li>
                  <a href={config.baseUrl}>Home</a>
                </li>
                <li>
                  <a href={`${config.baseUrl}/exhibitors`}>Exhibitors</a>
                </li>
                <li>{participant.name}</li>
              </ol>
            </nav>
            <ExhibitorDetailView {...toDisplayPropsFromParticipant(participant)} />
            <BottomBlock />
          </MainContainer>
        </main>
      );
    }

    switch (participant.status) {
      case "pending":
        return <ExhibitorPending />;
      case "declined":
        return <ExhibitorDeclined />;
      default:
        notFound();
    }
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      notFound();
    }
    throw error;
  }
}
