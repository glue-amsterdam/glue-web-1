import type { CSSProperties } from "react";
import type { RoutePrintProps } from "@/lib/map/route-print-props";

/**
 * Minimal A4 print shell for route download.
 * Layout/margins/styling beyond font + logo are intentionally left for design.
 */
export const RoutePrintTemplate = ({
  routeName,
  routeDescription,
  mapImageDataUrl,
  stops,
  primaryColor,
  logoSrc,
  eventDate,
}: RoutePrintProps) => {
  return (
    <article
      className="w-[210mm] bg-white font-[family-name:var(--font-lausanne)] text-black"
      style={
        {
          "--route-print-primary": primaryColor,
        } as CSSProperties
      }
      aria-label={`Printable route: ${routeName}`}
    >
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element -- print asset from data URL */}
        <img src={logoSrc} alt="GLUE" className="h-12 w-auto" />
        {eventDate ? <p>{eventDate}</p> : null}
        <h1>{routeName}</h1>
        {routeDescription?.trim() ? <p>{routeDescription.trim()}</p> : null}
      </header>

      {/* eslint-disable-next-line @next/next/no-img-element -- map capture data URL */}
      <img
        src={mapImageDataUrl}
        alt={`Map for ${routeName}`}
        className="h-auto w-full"
      />

      <section aria-label="Stops">
        <ul>
          {stops.map((stop) => (
            <li key={stop.dotId}>
              <span>{stop.label}</span> {stop.userName}
              {stop.addressLine ? ` — ${stop.addressLine}` : null}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};
