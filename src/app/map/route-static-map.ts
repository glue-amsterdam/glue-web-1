import type { Map as MapboxMap } from "mapbox-gl";
import type { Route } from "@/app/hooks/useMapData";
import type { RouteStopDisplay } from "@/app/map/route-stop-display";

const STYLE_OWNER = "mapbox";
const STYLE_ID = "dark-v11";
const ROUTE_LINE_COLOR = "#007cbf";

export type LngLatBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

const dotsSortedByStep = (route: Route) =>
  [...route.dots].sort((a, b) => a.route_step - b.route_step);

/** Geographic padding around stops (similar visual breathing room to fitBounds). */
export const computePaddedBoundsFromRoute = (
  route: Route,
  paddingRatio = 0.14,
): LngLatBounds => {
  const dots = dotsSortedByStep(route);
  if (dots.length === 0) {
    throw new Error("route-static-map: route has no dots");
  }

  const lngs = dots.map((d) => d.longitude);
  const lats = dots.map((d) => d.latitude);
  let west = Math.min(...lngs);
  let east = Math.max(...lngs);
  let south = Math.min(...lats);
  let north = Math.max(...lats);

  const spanLng = east - west || 0.02;
  const spanLat = north - south || 0.02;
  const padLng = spanLng * paddingRatio;
  const padLat = spanLat * paddingRatio;

  west -= padLng;
  east += padLng;
  south -= padLat;
  north += padLat;

  return { west, south, east, north };
};

/**
 * Bare Mapbox static map (no path/pins). Camera matches `bounds` exactly so we can draw on canvas in sync.
 */
export const buildBareStaticMapboxUrl = (
  bounds: LngLatBounds,
  width: number,
  height: number,
  accessToken: string,
): string => {
  if (!accessToken?.trim()) {
    throw new Error("route-static-map: missing Mapbox access token");
  }

  const bbox = `[${bounds.west},${bounds.south},${bounds.east},${bounds.north}]`;
  const token = encodeURIComponent(accessToken);
  return `https://api.mapbox.com/styles/v1/${STYLE_OWNER}/${STYLE_ID}/static/${bbox}/${width}x${height}@2x?access_token=${token}`;
};

/** Web Mercator normalized coords (0–1), same family Mapbox uses for fitting. */
const lngLatToMercatorNorm = (lng: number, lat: number) => {
  const x = (lng + 180) / 360;
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
  return { x, y };
};

export const lngLatToCanvasPx = (
  lng: number,
  lat: number,
  bounds: LngLatBounds,
  canvasWidth: number,
  canvasHeight: number,
): [number, number] => {
  const nw = lngLatToMercatorNorm(bounds.west, bounds.north);
  const se = lngLatToMercatorNorm(bounds.east, bounds.south);
  const p = lngLatToMercatorNorm(lng, lat);

  const x = ((p.x - nw.x) / (se.x - nw.x)) * canvasWidth;
  const y = ((p.y - nw.y) / (se.y - nw.y)) * canvasHeight;
  return [x, y];
};

const loadImageCors = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("route-static-map: failed to load map image"));
    img.src = src;
  });

/** Max logical side length for Static Images API (before @2x). */
const MAX_MAP_SIDE = 1280;

const requestSizeMatchingViewport = (
  containerWidthCss: number,
  containerHeightCss: number,
): [number, number] => {
  const cw = Math.max(1, Math.round(containerWidthCss));
  const ch = Math.max(1, Math.round(containerHeightCss));

  if (cw >= ch) {
    const w = MAX_MAP_SIDE;
    const h = Math.max(1, Math.round(MAX_MAP_SIDE * (ch / cw)));
    return [w, h];
  }

  const h = MAX_MAP_SIDE;
  const w = Math.max(1, Math.round(MAX_MAP_SIDE * (cw / ch)));
  return [w, h];
};

const boundsFromMapboxMap = (map: MapboxMap): LngLatBounds => {
  const b = map.getBounds();
  if (!b) {
    throw new Error("route-static-map: map bounds not available");
  }
  return {
    west: b.getWest(),
    south: b.getSouth(),
    east: b.getEast(),
    north: b.getNorth(),
  };
};

/**
 * Fetches a bare static basemap and draws dashed route + numbered stops (same colors as the app).
 * When `liveMap` is passed, dot positions match the interactive map (`getBounds` + `project`).
 */
export const composeRoutePrintMapDataUrl = async (
  route: Route,
  stops: RouteStopDisplay[],
  accessToken: string,
  liveMap?: MapboxMap | null,
): Promise<string> => {
  const container = liveMap?.getContainer();
  const useLiveCamera = Boolean(liveMap && container);

  const bounds = useLiveCamera
    ? boundsFromMapboxMap(liveMap!)
    : computePaddedBoundsFromRoute(route);

  const [reqW, reqH] = useLiveCamera
    ? requestSizeMatchingViewport(container!.clientWidth, container!.clientHeight)
    : [1280, 720];

  const baseUrl = buildBareStaticMapboxUrl(bounds, reqW, reqH, accessToken);
  const baseImage = await loadImageCors(baseUrl);

  const canvas = document.createElement("canvas");
  canvas.width = baseImage.naturalWidth;
  canvas.height = baseImage.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("route-static-map: no 2d context");
  }

  ctx.drawImage(baseImage, 0, 0);

  const sortedDots = dotsSortedByStep(route);
  const imgW = canvas.width;
  const imgH = canvas.height;

  const viewportW = useLiveCamera
    ? Math.max(1, container!.clientWidth)
    : imgW;
  const viewportH = useLiveCamera
    ? Math.max(1, container!.clientHeight)
    : imgH;

  const lngLatToPx = (lng: number, lat: number): [number, number] => {
    if (useLiveCamera) {
      const p = liveMap!.project([lng, lat]);
      const x = (p.x / viewportW) * imgW;
      const y = (p.y / viewportH) * imgH;
      return [x, y];
    }
    return lngLatToCanvasPx(lng, lat, bounds, imgW, imgH);
  };

  const lineWidth = Math.max(3, imgW / 320);

  if (sortedDots.length >= 2) {
    ctx.strokeStyle = ROUTE_LINE_COLOR;
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

  return canvas.toDataURL("image/jpeg", 0.78);
};
