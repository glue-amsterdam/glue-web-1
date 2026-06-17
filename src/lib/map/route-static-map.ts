import mapboxgl from "mapbox-gl";
import type { MapRoute } from "@/lib/map/types";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";

const MAP_STYLE_URI = "mapbox://styles/mapbox/light-v11";
const DEFAULT_ROUTE_LINE_COLOR = "#10069F";

export const PRINT_MAP_WIDTH = 1280;
export const PRINT_MAP_HEIGHT = 720;
const PRINT_PADDING_PX = 72;
const SINGLE_STOP_ZOOM = 14;
const PRINT_MAX_ZOOM = 17;

export type LngLatBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

const dotsSortedByStep = (route: MapRoute) =>
  [...route.dots].sort((a, b) => a.routeStep - b.routeStep);

const waitForMapLoad = (map: mapboxgl.Map): Promise<void> =>
  new Promise((resolve, reject) => {
    if (map.loaded()) {
      resolve();
      return;
    }

    map.once("load", () => resolve());
    map.once("error", (event) => {
      reject(event.error ?? new Error("route-static-map: map failed to load"));
    });
  });

const waitForMapIdle = (map: mapboxgl.Map): Promise<void> =>
  new Promise((resolve) => {
    map.once("idle", () => resolve());
  });

const createOffscreenPrintMap = async (
  accessToken: string
): Promise<{ map: mapboxgl.Map; container: HTMLDivElement }> => {
  mapboxgl.accessToken = accessToken;

  const container = document.createElement("div");
  container.style.width = `${PRINT_MAP_WIDTH}px`;
  container.style.height = `${PRINT_MAP_HEIGHT}px`;
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.pointerEvents = "none";
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);

  const map = new mapboxgl.Map({
    container,
    style: MAP_STYLE_URI,
    center: [0, 0],
    zoom: 0,
    bearing: 0,
    pitch: 0,
    interactive: false,
    attributionControl: false,
    preserveDrawingBuffer: true,
    fadeDuration: 0,
  });

  await waitForMapLoad(map);
  return { map, container };
};

const fitPrintMapToRoute = (map: mapboxgl.Map, route: MapRoute): void => {
  const dots = dotsSortedByStep(route);

  if (dots.length === 1) {
    const dot = dots[0];
    map.jumpTo({
      center: [dot.longitude, dot.latitude],
      zoom: SINGLE_STOP_ZOOM,
    });
    return;
  }

  const bounds = new mapboxgl.LngLatBounds();
  dots.forEach((dot) => {
    bounds.extend([dot.longitude, dot.latitude]);
  });

  map.fitBounds(bounds, {
    padding: PRINT_PADDING_PX,
    duration: 0,
    maxZoom: PRINT_MAX_ZOOM,
  });
};

/**
 * Fetches a basemap via offscreen Mapbox GL (same fitBounds/project as the interactive map)
 * and draws dashed route + numbered stops on top.
 */
export const composeRoutePrintMapDataUrl = async (
  route: MapRoute,
  stops: RouteStopDisplay[],
  accessToken: string,
  routeLineColor: string = DEFAULT_ROUTE_LINE_COLOR
): Promise<string> => {
  if (!accessToken?.trim()) {
    throw new Error("route-static-map: missing Mapbox access token");
  }

  let map: mapboxgl.Map | null = null;
  let container: HTMLDivElement | null = null;

  try {
    ({ map, container } = await createOffscreenPrintMap(accessToken));
    fitPrintMapToRoute(map, route);
    await waitForMapIdle(map);

    const mapCanvas = map.getCanvas();
    const cssWidth = map.getContainer().clientWidth;
    const scaleX = mapCanvas.width / cssWidth;
    const scaleY = mapCanvas.height / map.getContainer().clientHeight;

    const composite = document.createElement("canvas");
    composite.width = mapCanvas.width;
    composite.height = mapCanvas.height;
    const ctx = composite.getContext("2d");
    if (!ctx) {
      throw new Error("route-static-map: no 2d context");
    }

    ctx.drawImage(mapCanvas, 0, 0);

    const lngLatToPx = (lng: number, lat: number): [number, number] => {
      const point = map!.project([lng, lat]);
      return [point.x * scaleX, point.y * scaleY];
    };

    const sortedDots = dotsSortedByStep(route);
    const imgW = composite.width;
    const lineWidth = Math.max(3, imgW / 320);

    if (sortedDots.length >= 2) {
      ctx.strokeStyle = routeLineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([lineWidth * 3, lineWidth * 3]);
      ctx.beginPath();
      sortedDots.forEach((dot, i) => {
        const [x, y] = lngLatToPx(dot.longitude, dot.latitude);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const stop of stops) {
      const [x, y] = lngLatToPx(stop.longitude, stop.latitude);
      const r = Math.max(11, imgW / 85);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = stop.backgroundColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1.5, imgW / 450);
      ctx.stroke();

      ctx.fillStyle = stop.color;
      const fontPx = Math.round(Math.min(r * 1.15, imgW / 28));
      ctx.font = `bold ${fontPx}px system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stop.label, x, y);
    }

    return composite.toDataURL("image/jpeg", 0.78);
  } finally {
    map?.remove();
    container?.remove();
  }
};
