import BottomBlock from "@/components/bottom-block";
import ExhibitorHubDetailView from "@/components/exhibitors/exhibitor-hub-detail-view";
import MainContainer from "@/components/main-container";
import { config } from "@/config";
import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { fetchExhibitorDetailByHubId } from "@/lib/participants/fetch-exhibitor-detail";
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

    return {
      title,
      description,
      alternates: {
        canonical: `${config.baseUrl}/exhibitors/hub/${hubId}`,
      },
      openGraph: {
        title,
        description,
        url: `${config.baseUrl}/exhibitors/hub/${hubId}`,
        siteName: `GLUE ${config.cityName}`,
        images: ogImage
          ? [
              {
                url: ogImage,
                alt: `Image of ${hub.name}`,
              },
            ]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return {
      title: `GLUE ${config.cityName} | Exhibitor Hub`,
      description: `Exhibitor hub at GLUE ${config.cityName}.`,
    };
  }
}

export default async function ExhibitorHubPage({ params }: PageProps) {
  const { hubId } = await params;

  try {
    const hub = await fetchExhibitorDetailByHubId(hubId);
    return (
      <MainContainer>
        <ExhibitorHubDetailView hub={hub} />
        <BottomBlock />
      </MainContainer>
    );
  } catch (error) {
    if (error instanceof ExhibitorNotFoundError) {
      notFound();
    }
    throw error;
  }
}
