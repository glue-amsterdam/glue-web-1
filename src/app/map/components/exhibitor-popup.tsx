"use client";

import { memo, useCallback, useMemo } from "react";
import Image from "next/image";
import { Popup } from "react-map-gl/mapbox-legacy";
import type { ExhibitorPopupAnchor } from "@/lib/map/exhibitor-popup-layout";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { isMapHubEntity } from "@/lib/map/map-location-display";
import type { MapLocation, MapTourMode } from "@/lib/map/types";
import { useMapLocationDetail } from "../hooks/use-map-location-detail";
import RoundedNumber from "@/components/rounded-number";
import CrossRotatedDesktop from "@/components/icons/cross-rotated-desktop";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import { buildExhibitorFooterSlides, findExhibitorSlideIndex } from "@/lib/map/exhibitor-footer-slides";
import { buildGoogleMapsSearchUrl } from "@/lib/map/utils";
import BigButton from "@/components/big-button";
import SlideLineNav from "@/components/slide-line-nav";

type ExhibitorPopUpProps = {
  location: MapLocation;
  tourMode: MapTourMode;
  selectedHubMemberId?: string | null;
  anchor: ExhibitorPopupAnchor;
  offset: [number, number];
  onClose: () => void;
};

const ExhibitorPopUp = ({
  location,
  tourMode,
  selectedHubMemberId = null,
  anchor,
  offset,
  onClose,
}: ExhibitorPopUpProps) => {
  const canFetchDetail = tourMode === "live";
  const { detail, isLoading, error } = useMapLocationDetail(
    location.id,
    canFetchDetail
  );
  const slides = useMemo(
    () => buildExhibitorFooterSlides(location, detail),
    [location, detail]
  );

  const initialSlideIndex = useMemo(
    () => findExhibitorSlideIndex(slides, selectedHubMemberId),
    [slides, selectedHubMemberId]
  );

  const {
    currentIndex,
    hasMultiple,
    handleMouseEnter,
    handleMouseLeave,
    handleSelect,
  } = useCyclicIndex({
    itemCount: slides.length,
    delayMs: 3000,
    enabled: slides.length > 1,
    initialIndex: initialSlideIndex,
  });

  const currentSlide = slides[currentIndex] ?? slides[0];

  const handleGoogleMapsRedirect = useCallback(() => {
    window.open(buildGoogleMapsSearchUrl(location), "_blank");
  }, [location]);

  const isHubEntity = isMapHubEntity(location);

  const popupConfig = {
    longitude: location.longitude,
    latitude: location.latitude,
    onClose,
    closeButton: false,
    closeOnClick: false,
    anchor,
    offset,
    className: "custom-map-popup",
  };

  const showLoading = canFetchDetail && isLoading && !detail;

  return (
    <Popup {...popupConfig}>
      <div onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave} className="overflow-hidden border-t-2 border-(--black-color) px-[30px] pt-[15px] pb-[30px] text-(--black-color) bg-(--white-color) z-51 min-h-[452px] base-text-size w-[460px]">
        <div className="flex gap-[25px] items-start w-full">
          <RoundedNumber type={location.type} participant_n={location.displayNumber ?? " "} />
          <div className="w-full">
            <div className="w-full flex justify-between" aria-live="polite" aria-atomic="true">
              <h3 className="truncate ">{location.name.toUpperCase()}</h3>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer"
                aria-label="Close exhibitor details"
              >
                <CrossRotatedDesktop />
              </button>
            </div>
            <div className="pt-[15px] pl-[4px]">
              {isHubEntity ? (
                <p>{currentSlide.name}</p>
              ) : (
                <p>{location.addressLine}</p>
              )}
            </div>
          </div>
        </div>

        <div
          className={"flex w-full h-[250px] overflow-hidden mx-auto pt-[15px]"}
        >
          {showLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : currentSlide.imageUrl ? (

            <Image
              src={currentSlide.imageUrl}
              alt={`Image of ${currentSlide.name}`}
              width={300}
              height={190}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="h-full w-full object-contain object-center"
            />

          ) : <></>}</div>
        <SlideLineNav
          items={slides.map((slide) => ({ id: slide.id, label: slide.name }))}
          currentIndex={currentIndex}
          onSelect={handleSelect}
          ariaLabel={isHubEntity ? "Hub members" : "Exhibitor images"}
          size="compact"
        />
        <div className={`flex justify-center gap-[15px] ${hasMultiple ? "pt-[15px]" : "pt-[30px]"}`}>
          <BigButton
            as="button"
            mode="footer"
            fontSize="small"
            label="navigate"
            onClick={handleGoogleMapsRedirect} />
          {currentSlide.profileHref && (
            <BigButton
              as="link"
              mode="footer"
              fontSize="small"
              label="profile"
              href={currentSlide.profileHref} />
          )}
        </div>
      </div>
    </Popup >
  );
};

export default memo(ExhibitorPopUp);
