"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import ParticipantCard from "@/app/search/participant-card";
import EventCard from "@/app/search/event-card";
import { useColors } from "../context/MainContext";
import NavBar from "@/components/NavBar";
import { useSetPageDataset } from "@/hooks/useSetPageDataset";
import { Suspense } from "react";

interface Participant {
  id: string;
  user_name: string;
  plan_type: string;
  participant_details: {
    short_description: string | null;
    description: string | null;
    slug: string | null;
    is_sticky: boolean;
    year: number | null;
    status: string;
  };
  image_url: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  co_organizers: string[];
  co_organizers_names: string[];
  image_url?: string | null;
}

type SearchResult = {
  participants: Participant[];
  events: Event[];
};

const fetcher = async (url: string): Promise<SearchResult> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("An error occurred while fetching the data.");
  }
  return res.json();
};

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data, error, isLoading } = useSWR<SearchResult>(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  if (error) return <ErrorMessage message="Failed to load results" />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-uiwhite">{`Search Results for "${query}"`}</h1>
      {isLoading ? (
        <SearchSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResultSection
            title="Participants"
            items={data?.participants}
            renderItem={(participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            )}
          />
          <ResultSection
            title="Events"
            items={data?.events}
            renderItem={(event) => <EventCard key={event.id} event={event} />}
          />
        </div>
      )}
      {!isLoading && !data?.participants.length && !data?.events.length && (
        <NoResultsMessage query={query} />
      )}
    </div>
  );
}

export default function SearchPage() {
  useSetPageDataset("search");
  const { box4 } = useColors();

  return (
    <main style={{ backgroundColor: box4 }} className="min-h-dvh pt-[5rem]">
      <NavBar style={{ backgroundColor: box4 }} />
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent />
      </Suspense>
    </main>
  );
}

function ResultSection<T>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items?: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-uiwhite">{title}</h2>
      <div className="flex flex-col gap-4">{items.map(renderItem)}</div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-uiwhite">
          Participants
        </h2>
        {[...Array(1)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full mb-4" />
        ))}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4 text-uiwhite">Events</h2>
        {[...Array(1)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full mb-4" />
        ))}
      </div>
    </div>
  );
}

function NoResultsMessage({ query }: { query: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-lg text-uiwhite mb-2">{`No results found for "${query}"`}</p>
      <p className="text-sm text-gray-600">
        Try adjusting your search terms. Should be a participant or event name.
      </p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-lg text-uired">{message}</p>
      <p className="text-sm text-gray-600">
        Please try again later or contact support if the problem persists.
      </p>
    </div>
  );
}
