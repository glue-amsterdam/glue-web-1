import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BottomBlock from "@/components/bottom-block";
import MainContainer from "@/components/main-container";
import ProgramDetailView from "@/components/program/program-detail-view";
import { config } from "@/config";
import { fetchProgramDetail } from "@/lib/program/fetch-program-detail";
import { ProgramNotFoundError } from "@/lib/program/program-types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const event = await fetchProgramDetail(id);
    const title = `GLUE ${config.cityName} - ${event.name}`;
    const description =
      event.description ||
      `${event.name} at GLUE ${config.cityName} program.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${config.baseUrl}/program/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `${config.baseUrl}/program/${id}`,
        siteName: `GLUE ${config.cityName}`,
        images: event.eventImg
          ? [{ url: event.eventImg, alt: event.name }]
          : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: event.eventImg ? [event.eventImg] : undefined,
      },
    };
  } catch {
    return {
      title: `GLUE ${config.cityName} | Program`,
      description: `Program event at GLUE ${config.cityName}.`,
    };
  }
};

export default async function ProgramEventPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const event = await fetchProgramDetail(id);

    return (
      <main id="program-detail-page">
        <MainContainer>
          <ProgramDetailView event={event} />
          <BottomBlock />
        </MainContainer>
      </main>
    );
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      notFound();
    }
    throw error;
  }
}
