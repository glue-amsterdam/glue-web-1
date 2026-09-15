import { buildGlueLogoSrc } from "@/lib/map/route-print-logo";
import type { RoutePrintProps } from "@/lib/map/route-print-props";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";

const PLACEHOLDER_MAP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#e8e8e8"/>
  <path d="M80 620 L280 480 L520 540 L760 320 L980 400 L1120 220" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="280" cy="480" r="18" fill="#ef4444"/>
  <circle cx="520" cy="540" r="18" fill="#ef4444"/>
  <circle cx="760" cy="320" r="18" fill="#ef4444"/>
  <circle cx="980" cy="400" r="18" fill="#ef4444"/>
  <text x="600" y="760" text-anchor="middle" fill="#888" font-family="sans-serif" font-size="28">Map placeholder</text>
</svg>
`.trim();

const PRIMARY_COLOR = "#000000";

const PREVIEW_STOP_SEED: Array<
  Pick<
    RouteStopDisplay,
    "participantType" | "userName" | "addressLine" | "backgroundColor" | "color"
  >
> = [
  {
    participantType: "gallery",
    userName: "Studio Noord",
    addressLine: "Haarlemmerstraat 12, Amsterdam",
    backgroundColor: "#10069F",
    color: "#ffffff",
  },
  {
    participantType: "shop",
    userName: "Object & Form",
    addressLine: "Prinsengracht 88, Amsterdam",
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  {
    participantType: "gallery",
    userName: "Atelier Canal",
    addressLine: "Keizersgracht 210, Amsterdam",
    backgroundColor: "#10069F",
    color: "#ffffff",
  },
  {
    participantType: "hub",
    userName: "GLUE Hub West",
    addressLine: "Rozengracht 45, Amsterdam",
    backgroundColor: "#c4b5fd",
    color: "#10069F",
  },
  {
    participantType: "gallery",
    userName: "Paper Works",
    addressLine: "Westerstraat 9, Amsterdam",
    backgroundColor: "#10069F",
    color: "#ffffff",
  },
];

/** 25 stops so /dev/route-print-preview shows page 1 (20) + page 2 (5). */
const buildPreviewStops = (count: number): RouteStopDisplay[] =>
  Array.from({ length: count }, (_, index) => {
    const seed = PREVIEW_STOP_SEED[index % PREVIEW_STOP_SEED.length];
    const n = index + 1;
    return {
      dotId: `preview-${n}`,
      mapInfoId: `loc-${n}`,
      routeStep: n,
      participantType: seed.participantType,
      longitude: 4.89 + index * 0.001,
      latitude: 52.37 + index * 0.001,
      label: String(n).padStart(2, "0"),
      backgroundColor: seed.backgroundColor,
      color: seed.color,
      userName: `${seed.userName} ${n}`,
      addressLine: seed.addressLine,
    };
  });

export const ROUTE_PRINT_PREVIEW_FIXTURE: RoutePrintProps = {
  routeName: "Design District Walk",
  routeDescription:
    "A short walking route through studios, galleries, and independent shops.",
  mapImageDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PLACEHOLDER_MAP_SVG)}`,
  primaryColor: PRIMARY_COLOR,
  logoSrc: buildGlueLogoSrc(PRIMARY_COLOR),
  headerText: "17-19 September",
  footerText: "amsterdam connected by design",
  stops: buildPreviewStops(60),
};
