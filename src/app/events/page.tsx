import EventsClientPage from "./events-client-page";

export const metadata = {
  title: "GLUE Events",
  description: "Explore the events taking place at GLUE design routes.",
};

export default async function EventsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.append(key, value.toLowerCase());
    }
  });

  return <EventsClientPage params={params} />;
}
