import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BottomBlock from "@/components/bottom-block";
import MainContainer from "@/components/main-container";
import ProgramDetailView from "@/components/program/program-detail-view";
import { config } from "@/config";
import { fetchProgramDetail } from "@/lib/program/fetch-program-detail";
import { ProgramNotFoundError } from "@/lib/program/program-types";
import {
  buildEntityMetadata,
  buildFallbackEntityMetadata,
} from "@/lib/seo/build-entity-metadata";
import { buildProgramEventJsonLd } from "@/lib/seo/build-json-ld";

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

    return buildEntityMetadata({
      title,
      description,
      canonicalPath: `/program/${id}`,
      imageUrl: event.eventImg,
      imageAlt: event.name,
      keywords: [
        "GLUE",
        config.cityName,
        event.name,
        "program",
        "event",
        event.type,
      ],
      authors: [event.organizer.userName],
      creator: event.organizer.userName,
      structuredData: buildProgramEventJsonLd(event),
    });
  } catch {
    return buildFallbackEntityMetadata({
      title: `GLUE ${config.cityName} | Program`,
      description: `Program event at GLUE ${config.cityName}.`,
      canonicalPath: `/program/${id}`,
    });
  }
};

export default async function ProgramEventPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const event = await fetchProgramDetail(id);

    return (
      <main id="program-detail-page">
        <MainContainer className="stagger-enter-fade">
          <nav className="sr-only" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href={config.baseUrl}>Home</a>
              </li>
              <li>
                <a href={`${config.baseUrl}/program`}>Program</a>
              </li>
              <li>{event.name}</li>
            </ol>
          </nav>
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
