"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import type { MapLocation, MapRoute, MapTourMode } from "@/lib/map/types";
import type { RouteStopDisplay } from "@/lib/map/route-stop-display";
import { getRouteStopsForDisplay } from "@/lib/map/route-stop-display";
import { useMapLocationDetail } from "../hooks/use-map-location-detail";
import MainContainer from "@/components/main-container";
import RoundedNumber from "@/components/rounded-number";
import CrossRotatedMobile from "@/components/icons/cross-rotated-mobile";
import BigButton from "@/components/big-button";
import SlideLineNav from "@/components/slide-line-nav";

const DEFAULT_AUTOPLAY_DELAY_MS = 3000;

type RouteFooterProps = {
  route: MapRoute;
  locations: MapLocation[];
  tourMode: MapTourMode;
  delayMs?: number;
  activeStopId?: string | null;
  onActiveStopChange?: (stop: RouteStopDisplay) => void;
  onDownloadRoutePdf: () => void | Promise<void>;
  onClose: () => void;
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

const RouteFooter = ({
  route,
  locations,
  tourMode,
  delayMs = DEFAULT_AUTOPLAY_DELAY_MS,
  activeStopId,
  onActiveStopChange,
  onDownloadRoutePdf,
  onClose,
}: RouteFooterProps) => {
  const stops = useMemo(
    () => getRouteStopsForDisplay(route, locations),
    [route, locations]
  );

  const {
    currentIndex,
    hasMultiple,
    setCurrentIndex,
    handleMouseEnter,
    handleMouseLeave,
    handleSelect,
  } = useCyclicIndex({
    itemCount: stops.length,
    delayMs,
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

  if (!currentStop) {
    return null;
  }

  return (
    <div
      data-route-footer
      className="fixed bottom-0 mb-(--site-footer-h) left-0 right-0 text-(--black-color) bg-(--white-color) z-51 h-[350px] base-text-size"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MainContainer>
        <div className="border-t border-(--black-color) px-[20px] pt-[15px] pb-[20px]">
          <div className="flex gap-[25px] items-start w-full">
            <RouteStopBadge stop={currentStop} />
            <div className="w-full">
              <div
                className="w-full flex justify-between"
                aria-live="polite"
                aria-atomic="true"
              >
                <h3 className="truncate">{route.name}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer"
                  aria-label="Close route details"
                >
                  <CrossRotatedMobile />
                </button>
              </div>
              <div className="pt-[15px] pl-[4px]">
                <p>{currentStop.addressLine}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full h-[190px] overflow-hidden mx-auto pt-[15px]">
            <RouteStopSlide stop={currentStop} tourMode={tourMode} />
          </div>
          <SlideLineNav
            items={stops.map((stop) => ({ id: stop.dotId, label: stop.userName }))}
            currentIndex={currentIndex}
            onSelect={handleSelect}
            ariaLabel="Route stops"
            size="compact"
          />
          <div className={`flex justify-center gap-[15px] ${hasMultiple ? "pt-[10px]" : "pt-[15px]"}`}>
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
      </MainContainer>
    </div>
  );
};

export default memo(RouteFooter);
