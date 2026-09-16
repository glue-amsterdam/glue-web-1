import type { CSSProperties } from "react";
import RoundedNumber from "@/components/rounded-number";
import type { RoutePrintProps } from "@/lib/map/route-print-props";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";
import { ROUTE_PRINT_FIGMA } from "@/lib/map/route-print-figma";
import {
  ROUTE_PRINT_STOPS_ROWS,
  type RoutePrintPageKind,
} from "@/lib/map/route-print-pages";
import { config } from "@/config";

type RoutePrintTemplateProps = RoutePrintProps & {
  /** primary = map + 4×5; continuation = header/footer + same 4×5 block. */
  variant?: RoutePrintPageKind;
};

const StopsGrid = ({ stops }: { stops: RouteStopDisplay[] }) => (
  <ul
    className="grid w-full grid-flow-col content-start gap-x-[80px] gap-y-[48px]"
    style={{
      gridTemplateRows: `repeat(${ROUTE_PRINT_STOPS_ROWS}, auto)`,
      gridAutoColumns: "minmax(0, 1fr)",
    }}
  >
    {stops.map((stop) => (
      <li key={stop.dotId} className="flex items-start gap-[28px]">
        <RoundedNumber
          type={stop.participantType ?? "route"}
          participant_n={stop.label}
          size="print"
          backgroundColor={stop.backgroundColor}
          color={stop.color}
        />
        <div className="min-w-0 break-words">
          <p className="text-[38px] leading-[50px]">{stop.userName}</p>
          {stop.addressLine ? (
            <p className="text-[38px] leading-[50px]">{stop.addressLine}</p>
          ) : null}
        </div>
      </li>
    ))}
  </ul>
);

/**
 * Route download print layout.
 * Sized in Figma artboard px (2470×3494) — use Figma values 1:1 (padding,
 * type, gaps). RoutePrintSheet scales this canvas to A4 for preview/print.
 */
export const RoutePrintTemplate = ({
  routeName,
  routeDescription,
  mapImageDataUrl,
  stops,
  primaryColor,
  logoSrc,
  headerText,
  footerText,
  variant = "primary",
}: RoutePrintTemplateProps) => {
  const isPrimary = variant === "primary";

  return (
    <article
      className="box-border flex flex-col bg-white font-[family-name:var(--font-lausanne)] text-[48px] leading-normal text-black"
      style={
        {
          width: ROUTE_PRINT_FIGMA.width,
          height: ROUTE_PRINT_FIGMA.height,
          padding: `${ROUTE_PRINT_FIGMA.paddingY}px ${ROUTE_PRINT_FIGMA.paddingX}px`,
          "--route-print-primary": primaryColor,
        } as CSSProperties
      }
      aria-label={`GLUE ${config.cityName} route: ${routeName}`}
    >
      <header className="shrink-0 border-b-[4px] border-(--black-color)">
        <div className="flex justify-between pb-[30px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- print asset from data URL */}
          <img src={logoSrc} alt="GLUE" className="h-[160px] w-auto p-1" />
          <p className="text-[100px] leading-[116px]">
            {headerText}
          </p>
        </div>
      </header>

      {isPrimary ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <h1 className="shrink-0 pt-[160px] text-[100px] leading-[116px] uppercase">
            {routeName}
          </h1>

          {routeDescription?.trim() ? (
            <div className="max-h-[450px] shrink-0 columns-2 gap-[60px] overflow-hidden pt-[120px]">
              <p className="text-[46px] leading-[58px]">
                {routeDescription.trim()}
              </p>
            </div>
          ) : null}

          <div className="shrink-0 pt-[120px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- map capture data URL */}
            <img
              src={mapImageDataUrl}
              alt={`Map for ${routeName}`}
              width={ROUTE_PRINT_FIGMA.mapWidth}
              height={ROUTE_PRINT_FIGMA.mapHeight}
              className="w-full"
              style={{
                height: ROUTE_PRINT_FIGMA.mapHeight,
              }}
            />
          </div>

          <section
            aria-label="Stops"
            className="flex min-h-0 flex-1 flex-col pt-[120px]"
          >
            <StopsGrid stops={stops} />
          </section>
        </div>
      ) : (
        <section
          aria-label="Stops"
          className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[120px]"
        >
          <StopsGrid stops={stops} />
        </section>
      )}

      <footer className="shrink-0 border-t-[4px] border-(--black-color)">
        <p className="text-[100px] leading-[116px] text-right pt-[30px]">{footerText}</p>
      </footer>
    </article>
  );
};
