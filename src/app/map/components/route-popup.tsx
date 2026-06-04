"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { Popup } from "react-map-gl/mapbox-legacy";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import type { ExhibitorPopupAnchor } from "@/lib/map/exhibitor-popup-layout";
import type { MapLocation, MapRoute, MapTourMode } from "@/lib/map/types";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";
import { getRouteStopsForDisplay } from "@/lib/map/route-stop-display";
import { useMapLocationDetail } from "../hooks/use-map-location-detail";
import RoundedNumber from "@/components/rounded-number";
import CrossRotatedDesktop from "@/components/icons/cross-rotated-desktop";
import BigButton from "@/components/big-button";

const DEFAULT_AUTOPLAY_DELAY_MS = 3000;

type RoutePopupProps = {
  route: MapRoute;
  locations: MapLocation[];
  tourMode: MapTourMode;
  anchor: ExhibitorPopupAnchor;
  offset: [number, number];
  activeStopId?: string | null;
  onActiveStopChange?: (stop: RouteStopDisplay) => void;
  onClose: () => void;
  onDownloadRoutePdf: () => void | Promise<void>;
};

type RouteStopBadgeProps = {
  stop: RouteStopDisplay;
};

const RouteStopBadge = ({ stop }: RouteStopBadgeProps) => {
  if (stop.participantType) {
    return (
      <RoundedNumber
        type={stop.participantType}
        participant_n={String(stop.routeStep)}
      />
    );
  }

  return (
    <div
      className="flex size-[26px] shrink-0 items-center justify-center rounded-full font-lausanne md:size-[30px] text-[15px] leading-none tabular-nums"
      style={{
        backgroundColor: stop.backgroundColor,
        color: stop.color,
      }}
      aria-hidden
    >
      <span className="m-0 block min-w-[1ch] text-center translate-y-[1.5px]">
        {stop.routeStep}
      </span>
    </div>
  );
};

type RouteStopSlideProps = {
  stop: RouteStopDisplay;
  tourMode: MapTourMode;
};

const RouteStopSlide = ({ stop, tourMode }: RouteStopSlideProps) => {
  const canFetchDetail = tourMode === "live" && !!stop.mapInfoId;
  const { detail, isLoading } = useMapLocationDetail(stop.mapInfoId, canFetchDetail);
  const showLoading = canFetchDetail && isLoading && !detail;

  if (showLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (detail?.imageUrl) {
    return (
      <Image
        src={detail.imageUrl}
        alt={`Image of ${stop.userName}`}
        width={300}
        height={190}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="h-full w-full object-contain object-top"
      />
    );
  }

  return null;
};

const RoutePopup = ({
  route,
  locations,
  tourMode,
  anchor,
  offset,
  activeStopId,
  onActiveStopChange,
  onClose,
  onDownloadRoutePdf,
}: RoutePopupProps) => {
  const stops = useMemo(
    () => getRouteStopsForDisplay(route, locations),
    [route, locations]
  );

  const {
    currentIndex,
    setCurrentIndex,
    handleMouseEnter,
    handleMouseLeave,
  } = useCyclicIndex({
    itemCount: stops.length,
    delayMs: DEFAULT_AUTOPLAY_DELAY_MS,
    enabled: stops.length > 1,
  });

  const currentStop = stops[currentIndex] ?? stops[0];

  useEffect(() => {
    if (!activeStopId || stops.length === 0) return;
    const stopIndex = stops.findIndex((stop) => stop.dotId === activeStopId);
    if (stopIndex >= 0) {
      setCurrentIndex(stopIndex);
    }
  }, [activeStopId, stops, setCurrentIndex]);

  useEffect(() => {
    if (!currentStop || !onActiveStopChange) return;
    onActiveStopChange(currentStop);
  }, [currentStop, onActiveStopChange]);

  const redirectRouteToGoogleMaps = useCallback(() => {
    if (route.dots.length === 0) return;
    const origin = `${route.dots[0].latitude},${route.dots[0].longitude}`;
    const destination = `${route.dots[route.dots.length - 1].latitude},${route.dots[route.dots.length - 1].longitude}`;
    const waypoints = route.dots
      .slice(1, -1)
      .map((dot) => `${dot.latitude},${dot.longitude}`)
      .join("|");
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    window.open(url, "_blank");
  }, [route.dots]);

  const handleDownloadPdf = useCallback(() => {
    void onDownloadRoutePdf();
  }, [onDownloadRoutePdf]);

  if (!currentStop) return null;

  const popupConfig = {
    longitude: currentStop.longitude,
    latitude: currentStop.latitude,
    onClose,
    closeButton: false,
    closeOnClick: false,
    anchor,
    offset,
    className: "custom-map-popup",
  };

  return (
    <Popup {...popupConfig}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="overflow-hidden border-t-2 border-(--black-color) px-[30px] pt-[15px] pb-[30px] text-(--black-color) bg-(--white-color) z-51 min-h-[452px] base-text-size w-[460px]"
      >
        <div className="flex gap-[25px] items-start w-full">
          <RouteStopBadge stop={currentStop} />
          <div className="w-full">
            <div
              className="w-full flex justify-between"
              aria-live="polite"
              aria-atomic="true"
            >
              <h3 className="truncate">{currentStop.userName.toUpperCase()}</h3>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer"
                aria-label="Close route details"
              >
                <CrossRotatedDesktop />
              </button>
            </div>
            <div className="pt-[15px] pl-[4px]">
              <p>{currentStop.addressLine}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full h-[250px] overflow-hidden mx-auto pt-[15px]">
          <RouteStopSlide stop={currentStop} tourMode={tourMode} />
        </div>

        <div className="flex justify-center pt-[30px] gap-[15px]">
          <BigButton
            as="button"
            mode="footer"
            fontSize="small"
            label="navigate"
            onClick={redirectRouteToGoogleMaps}
          />
          <BigButton
            as="button"
            mode="footer"
            fontSize="small"
            label="download"
            onClick={handleDownloadPdf}
          />
        </div>
      </div>
    </Popup>
  );
};

export default memo(RoutePopup);
