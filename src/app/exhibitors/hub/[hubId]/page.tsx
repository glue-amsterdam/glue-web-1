import BottomBlock from "@/components/bottom-block";
import ExhibitorHubDetailView from "@/components/exhibitors/exhibitor-hub-detail-view";
import MainContainer from "@/components/main-container";
import { config } from "@/config";
import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { fetchExhibitorDetailByHubId } from "@/lib/participants/fetch-exhibitor-detail";
import {
  buildEntityMetadata,
  buildFallbackEntityMetadata,
} from "@/lib/seo/build-entity-metadata";
import { buildExhibitorHubJsonLd } from "@/lib/seo/build-json-ld";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ hubId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { hubId } = await params;

  try {
    const hub = await fetchExhibitorDetailByHubId(hubId);
    const title = `GLUE ${config.cityName} - ${hub.name}`;
    const description =
      hub.description ?? `Discover ${hub.name} at GLUE ${config.cityName}.`;
    const ogImage = hub.members[0]?.imageUrl;

    return buildEntityMetadata({
      title,
      description,
      canonicalPath: `/exhibitors/hub/${hubId}`,
      imageUrl: ogImage,
      imageAlt: `Image of ${hub.name}`,
      keywords: [
        "GLUE",
        config.cityName,
        hub.name,
        "exhibitor hub",
        "design routes",
      ],
      authors: [hub.name],
      creator: hub.name,
      structuredData: buildExhibitorHubJsonLd(hub),
    });
  } catch {
    return buildFallbackEntityMetadata({
      title: `GLUE ${config.cityName} | Exhibitor Hub`,
      description: `Exhibitor hub at GLUE ${config.cityName}.`,
      canonicalPath: `/exhibitors/hub/${hubId}`,
    });
  }
}

export default async function ExhibitorHubPage({ params }: PageProps) {
  const { hubId } = await params;

  try {
    const hub = await fetchExhibitorDetailByHubId(hubId);

    return (
      <main id="exhibitor-detail-page">
        <MainContainer>
          <nav className="sr-only" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href={config.baseUrl}>Home</a>
              </li>
              <li>
                <a href={`${config.baseUrl}/exhibitors`}>Exhibitors</a>
              </li>
              <li>{hub.name}</li>
            </ol>
          </nav>
          <ExhibitorHubDetailView hub={hub} />
          <BottomBlock />
        </MainContainer>
      </main>
    );
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      notFound();
    }
    throw error;
  }
}
