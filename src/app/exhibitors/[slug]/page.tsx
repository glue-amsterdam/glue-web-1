import BottomBlock from "@/components/bottom-block";
import ExhibitorDeclined from "@/components/exhibitors/exhibitor-declined";
import ExhibitorDetailView from "@/components/exhibitors/exhibitor-detail-view";
import ExhibitorPending from "@/components/exhibitors/exhibitor-pending";
import MainContainer from "@/components/main-container";
import { config } from "@/config";
import { ExhibitorNotFoundError } from "@/lib/participants/exhibitor-detail-types";
import { fetchExhibitorDetailBySlug } from "@/lib/participants/fetch-exhibitor-detail";
import { toDisplayPropsFromParticipant } from "@/lib/participants/map-exhibitor-display-props";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

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

        return {
            title,
            description,
            alternates: {
                canonical: `${config.baseUrl}/exhibitors/${slug}`,
            },
            openGraph: {
                title,
                description,
                url: `${config.baseUrl}/exhibitors/${slug}`,
                siteName: `GLUE ${config.cityName}`,
                images: [
                    {
                        url: exhibitor.imageUrl,
                        alt: `Profile image of ${exhibitor.name}`,
                    },
                ],
                type: "profile",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [exhibitor.imageUrl],
            },
        };
    } catch {
        return {
            title: `GLUE ${config.cityName} | Exhibitor`,
            description: `Exhibitor profile at GLUE ${config.cityName}.`,
        };
    }
}

export default async function ExhibitorPage({ params }: PageProps) {
    const { slug } = await params;

    try {
        const participant = await fetchExhibitorDetailBySlug(slug);

        if (participant.is_sticky || participant.status === "accepted") {
            return (
                <MainContainer>
                    <ExhibitorDetailView {...toDisplayPropsFromParticipant(participant)} />
                    <BottomBlock />
                </MainContainer>
            );
        }

        switch (participant.status) {
            case "pending":
                return <ExhibitorPending />;
            case "declined":
                return <ExhibitorDeclined />;
            default:
                throw new Error(`Unknown exhibitor status: ${participant.status}`);
        }
    } catch (error) {
        if (error instanceof ExhibitorNotFoundError) {
            notFound();
        }
        throw error;
    }
}
