import Link from "next/link";
import { config } from "@/config";
import { getMapLocationProfileLink } from "@/lib/map/map-location-profile-link";
import type { MapPageData } from "@/lib/map/types";

type Props = {
  initialData: MapPageData;
};

const MapSeoFallback = ({ initialData }: Props) => {
  const locationsWithLinks = initialData.locations
    .map((location) => ({
      location,
      href: getMapLocationProfileLink(location),
    }))
    .filter(
      (
        entry
      ): entry is {
        location: (typeof initialData.locations)[number];
        href: string;
      } => Boolean(entry.href)
    );

  return (
    <div className="sr-only">
      <h1>{`GLUE ${config.cityName} map`}</h1>
      <p>
        Explore the GLUE {config.cityName} design route map — find exhibitors,
        hubs, and curated routes.
      </p>
      {locationsWithLinks.length > 0 ? (
        <ul>
          {locationsWithLinks.map(({ location, href }) => (
            <li key={location.id}>
              <Link href={href}>{location.name}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default MapSeoFallback;
