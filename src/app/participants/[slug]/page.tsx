import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ParticipantRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/exhibitors/${slug}`);
}
